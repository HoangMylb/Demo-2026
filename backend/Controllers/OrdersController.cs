using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace Backend.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(AppDbContext context, IConfiguration configuration, IWebHostEnvironment environment) : ControllerBase
{
  private readonly AppDbContext _context = context;
  private readonly IConfiguration _configuration = configuration;
  private readonly IWebHostEnvironment _environment = environment;

  [HttpGet("checkout/prefill")]
  public async Task<ActionResult<CheckoutPrefillDto>> GetCheckoutPrefill()
  {
    var user = await FindCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    return this.ApiOk(new CheckoutPrefillDto(user.FullName, user.Email, user.PhoneNumber, user.Address));
  }

  [HttpGet("mine")]
  public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
  {
    var user = await FindCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    var orders = await _context.Orders
      .AsNoTracking()
      .Include(order => order.Items)
      .Where(order => order.UserId == user.Id)
      .OrderByDescending(order => order.CreatedAtUtc)
      .ToListAsync();

    return this.ApiOk(orders.Select(MapOrderDto).ToList());
  }

  [HttpGet("session/{sessionId}")]
  public async Task<ActionResult<OrderDto>> GetOrderBySessionId(string sessionId)
  {
    var user = await FindCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    var order = await _context.Orders
      .AsNoTracking()
      .Include(order => order.Items)
      .FirstOrDefaultAsync(order => order.StripeCheckoutSessionId == sessionId && order.UserId == user.Id);

    if (order is null)
    {
      return this.ApiNotFound("The requested order was not found.");
    }

    return this.ApiOk(MapOrderDto(order));
  }

  [HttpPost("checkout/session")]
  public async Task<ActionResult<CreateCheckoutSessionResponseDto>> CreateCheckoutSession([FromBody] CreateCheckoutSessionDto request)
  {
    var stripeSecretKey = _configuration["Stripe:SecretKey"];
    if (string.IsNullOrWhiteSpace(stripeSecretKey))
    {
      return this.ApiError(500, "Stripe SecretKey is not configured on the server.");
    }

    var user = await FindCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    if (user.IsLocked || !user.IsApproved)
    {
      return this.ApiError(403, "Your account cannot place orders right now.");
    }

    if (request.Items.Count == 0)
    {
      return this.ApiBadRequest("Cart items are required.");
    }

    if (request.Items.Any(item => item.ProductId <= 0))
    {
      return this.ApiBadRequest("Each cart item must include a valid product id.");
    }

    if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Address))
    {
      return this.ApiBadRequest("Full name, email, phone number, and address are required.");
    }

    var normalizedEmail = request.Email.Trim().ToLowerInvariant();
    var productIds = request.Items.Select(item => item.ProductId).Distinct().ToList();
    var products = await _context.Products
      .AsNoTracking()
      .Where(product => productIds.Contains(product.Id))
      .ToDictionaryAsync(product => product.Id);

    if (products.Count != productIds.Count)
    {
      return this.ApiBadRequest("One or more products in the cart are invalid.");
    }

    user.FullName = request.FullName.Trim();
    user.Email = normalizedEmail;
    user.PhoneNumber = request.PhoneNumber.Trim();
    user.Address = request.Address.Trim();

    var lineItems = new List<SessionLineItemOptions>();
    var orderItems = new List<OrderItem>();
    decimal totalAmount = 0;

    foreach (var item in request.Items)
    {
      if (!products.TryGetValue(item.ProductId, out var product))
      {
        return this.ApiBadRequest("One or more products in the cart are invalid.");
      }

      if (item.Quantity <= 0)
      {
        return this.ApiBadRequest("Item quantity must be greater than zero.");
      }

      var unitAmount = decimal.Round(product.Price, 2);
      var lineTotal = unitAmount * item.Quantity;
      totalAmount += lineTotal;

      orderItems.Add(new OrderItem
      {
        ProductId = product.Id,
        ProductName = product.Name,
        ProductImageUrl = product.ImageUrl,
        UnitPrice = unitAmount,
        Quantity = item.Quantity,
        LineTotal = lineTotal,
      });

      lineItems.Add(new SessionLineItemOptions
      {
        Quantity = item.Quantity,
        PriceData = new SessionLineItemPriceDataOptions
        {
          Currency = "usd",
          UnitAmount = (long)(unitAmount * 100),
          ProductData = new SessionLineItemPriceDataProductDataOptions
          {
            Name = product.Name,
            Images = [product.ImageUrl],
            Metadata = new Dictionary<string, string>
            {
              ["product_id"] = product.Id.ToString(),
            },
          },
        },
      });
    }

    var order = new Order
    {
      UserId = user.Id,
      CustomerName = user.FullName,
      CustomerEmail = user.Email,
      PhoneNumber = user.PhoneNumber,
      ShippingAddress = user.Address,
      Status = "Pending",
      PaymentStatus = "Pending",
      Currency = "usd",
      TotalAmount = totalAmount,
      CreatedAtUtc = DateTime.UtcNow,
      UpdatedAtUtc = DateTime.UtcNow,
      Items = orderItems,
    };

    _context.Orders.Add(order);
    await _context.SaveChangesAsync();

    var frontendBaseUrl = ResolveFrontendBaseUrl();
    var options = new SessionCreateOptions
    {
      Mode = "payment",
      LineItems = lineItems,
      CustomerEmail = order.CustomerEmail,
      ClientReferenceId = order.Id.ToString(),
      SuccessUrl = $"{frontendBaseUrl}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
      CancelUrl = $"{frontendBaseUrl}/checkout/failed?session_id={{CHECKOUT_SESSION_ID}}",
      Metadata = new Dictionary<string, string>
      {
        ["order_id"] = order.Id.ToString(),
        ["user_id"] = user.Id.ToString(),
      },
    };

    StripeConfiguration.ApiKey = stripeSecretKey;

    var service = new SessionService();
    var session = await service.CreateAsync(options);

    order.StripeCheckoutSessionId = session.Id;
    order.StripePaymentIntentId = session.PaymentIntentId;
    order.StripeCustomerId = session.CustomerId;
    order.UpdatedAtUtc = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return this.ApiOk(new CreateCheckoutSessionResponseDto(order.Id, session.Url ?? string.Empty, session.Id));
  }

  [AllowAnonymous]
  [HttpPost("webhook")]
  public async Task<IActionResult> HandleStripeWebhook()
  {
    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
    var webhookSecret = _configuration["Stripe:WebhookSecret"];

    Event stripeEvent;

    try
    {
      stripeEvent = !string.IsNullOrWhiteSpace(webhookSecret)
        ? EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], webhookSecret)
        : EventUtility.ParseEvent(json);
    }
    catch (Exception exception)
    {
      return BadRequest(exception.Message);
    }

    if (stripeEvent.Type is "checkout.session.completed" or "checkout.session.async_payment_succeeded" or "checkout.session.async_payment_failed")
    {
      var session = stripeEvent.Data.Object as Session;
      if (session is not null)
      {
        await UpdateOrderPaymentStatusAsync(session, stripeEvent.Type);
      }
    }

    return Ok();
  }

  private async Task UpdateOrderPaymentStatusAsync(Session session, string eventType)
  {
    var order = await _context.Orders.FirstOrDefaultAsync(item => item.StripeCheckoutSessionId == session.Id);
    if (order is null)
    {
      return;
    }

    order.StripePaymentIntentId = session.PaymentIntentId;
    order.StripeCustomerId = session.CustomerId;
    order.PaymentStatus = eventType == "checkout.session.async_payment_failed" ? "Failed" : session.PaymentStatus;
    order.Status = eventType == "checkout.session.async_payment_failed"
      ? "PaymentFailed"
      : session.PaymentStatus == "paid"
        ? "Paid"
        : order.Status;
    order.UpdatedAtUtc = DateTime.UtcNow;

    await _context.SaveChangesAsync();
  }

  private async Task<User?> FindCurrentUserAsync()
  {
    var email = User.GetUserEmail();
    if (string.IsNullOrWhiteSpace(email))
    {
      return null;
    }

    var normalizedEmail = email.Trim().ToLowerInvariant();
    return await _context.Users.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail || item.UserName.ToLower() == normalizedEmail);
  }

  private string ResolveFrontendBaseUrl()
  {
    var configuredFrontendUrl = _configuration["Frontend:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(configuredFrontendUrl))
    {
      return configuredFrontendUrl.TrimEnd('/');
    }

    if (_environment.IsDevelopment())
    {
      return "http://localhost:5173";
    }

    return "https://hoangmydemo.online";
  }

  private static OrderDto MapOrderDto(Order order)
  {
    return new OrderDto(
      order.Id,
      order.UserId,
      order.CustomerName,
      order.CustomerEmail,
      order.PhoneNumber,
      order.ShippingAddress,
      order.Status,
      order.PaymentStatus,
      order.Currency,
      order.TotalAmount,
      order.StripeCheckoutSessionId,
      order.StripePaymentIntentId,
      order.CreatedAtUtc,
      order.UpdatedAtUtc,
      order.Items.Select(item => new OrderItemDto(item.Id, item.ProductId, item.ProductName, item.ProductImageUrl, item.UnitPrice, item.Quantity, item.LineTotal)).ToList()
    );
  }
}
