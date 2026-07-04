namespace Backend.Dtos;

public record CheckoutPrefillDto(
  string FullName,
  string Email,
  string PhoneNumber,
  string Address
);

public record CheckoutCartItemDto(
  int ProductId,
  string ProductName,
  string ProductImageUrl,
  decimal UnitPrice,
  int Quantity
);

public class CreateCheckoutSessionDto
{
  public string FullName { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string PhoneNumber { get; set; } = string.Empty;
  public string Address { get; set; } = string.Empty;
  public List<CheckoutCartItemDto> Items { get; set; } = [];
}

public record CreateCheckoutSessionResponseDto(
  int OrderId,
  string Status,
  string PaymentStatus
);

public class UpdateOrderStatusDto
{
  public string Status { get; set; } = string.Empty;
}

public record OrderItemDto(
  int Id,
  int ProductId,
  string ProductName,
  string ProductImageUrl,
  decimal UnitPrice,
  int Quantity,
  decimal LineTotal
);

public record OrderDto(
  int Id,
  int UserId,
  string CustomerName,
  string CustomerEmail,
  string PhoneNumber,
  string ShippingAddress,
  string Status,
  string PaymentStatus,
  string Currency,
  decimal TotalAmount,
  DateTime CreatedAtUtc,
  DateTime UpdatedAtUtc,
  IReadOnlyList<OrderItemDto> Items
);
