using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Backend.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

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

  [HttpPost("checkout/session")]
  public async Task<ActionResult<CreateCheckoutSessionResponseDto>> CreateCheckoutSession([FromBody] CreateCheckoutSessionDto request)
  {
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

    }

    var order = new Order
    {
      UserId = user.Id,
      CustomerName = user.FullName,
      CustomerEmail = user.Email,
      PhoneNumber = user.PhoneNumber,
      ShippingAddress = user.Address,
      Status = "Order",
      PaymentStatus = "Paid",
      Currency = "usd",
      TotalAmount = totalAmount,
      CreatedAtUtc = DateTime.UtcNow,
      UpdatedAtUtc = DateTime.UtcNow,
      Items = orderItems,
    };

    _context.Orders.Add(order);
    await _context.SaveChangesAsync();

    return this.ApiOk(
      new CreateCheckoutSessionResponseDto(order.Id, order.Status, order.PaymentStatus),
      "Demo payment completed successfully.");
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
      order.CreatedAtUtc,
      order.UpdatedAtUtc,
      order.Items.Select(item => new OrderItemDto(item.Id, item.ProductId, item.ProductName, item.ProductImageUrl, item.UnitPrice, item.Quantity, item.LineTotal)).ToList()
    );
  }
}
