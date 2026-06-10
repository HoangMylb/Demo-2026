using Backend.Data;
using Backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
  {
    var orders = await _context.Orders
      .AsNoTracking()
      .Include(order => order.Items)
      .OrderByDescending(order => order.CreatedAtUtc)
      .ToListAsync();

    return this.Ok(new
    {
      code = 0,
      message = "Request completed successfully",
      data = orders.Select(order => new OrderDto(
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
      ))
    });
  }
}
