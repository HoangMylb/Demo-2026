namespace Backend.Models;

public class Order
{
  public int Id { get; set; }
  public int UserId { get; set; }
  public User? User { get; set; }
  public string CustomerName { get; set; } = string.Empty;
  public string CustomerEmail { get; set; } = string.Empty;
  public string PhoneNumber { get; set; } = string.Empty;
  public string ShippingAddress { get; set; } = string.Empty;
  public string Status { get; set; } = "Order";
  public string PaymentStatus { get; set; } = "Paid";
  public string Currency { get; set; } = "usd";
  public decimal TotalAmount { get; set; }
  public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
  public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
