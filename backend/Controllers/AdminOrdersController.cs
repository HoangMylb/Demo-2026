using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
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
      data = orders.Select(MapOrderDto)
    });
  }

  [HttpPatch("{id:int}/status")]
  public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto request)
  {
    var nextStatus = request.Status.Trim();
    if (string.IsNullOrWhiteSpace(nextStatus))
    {
      return this.ApiBadRequest("Order status is required.");
    }

    var allowedStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
      "Order",
      "Processing",
      "Shipping",
      "Delivered",
      "Cancelled",
    };

    if (!allowedStatuses.Contains(nextStatus))
    {
      return this.ApiBadRequest("Order status is invalid.");
    }

    var order = await _context.Orders
      .Include(item => item.Items)
      .FirstOrDefaultAsync(item => item.Id == id);

    if (order is null)
    {
      return this.ApiNotFound("The requested order was not found.");
    }

    order.Status = allowedStatuses.First(status => string.Equals(status, nextStatus, StringComparison.OrdinalIgnoreCase));
    order.UpdatedAtUtc = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return this.ApiOk(MapOrderDto(order), "Order status updated successfully.");
  }

  [HttpDelete("{id:int}")]
  public async Task<IActionResult> DeleteOrder(int id)
  {
    var order = await _context.Orders.FirstOrDefaultAsync(item => item.Id == id);
    if (order is null)
    {
      return this.ApiNotFound("The requested order was not found.");
    }

    _context.Orders.Remove(order);
    await _context.SaveChangesAsync();

    return this.ApiOk<object?>(null, "Order deleted successfully.");
  }

  private static OrderDto MapOrderDto(Backend.Models.Order order) => new(
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
