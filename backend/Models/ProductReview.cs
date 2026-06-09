namespace Backend.Models;

public class ProductReview
{
  public int Id { get; set; }
  public int ProductId { get; set; }
  public Product? Product { get; set; }
  public int UserId { get; set; }
  public User? User { get; set; }
  public string CustomerName { get; set; } = string.Empty;
  public int Rating { get; set; }
  public string Comment { get; set; } = string.Empty;
  public string VariantType { get; set; } = string.Empty;
  public string Color { get; set; } = string.Empty;
  public string Size { get; set; } = string.Empty;
  public int HelpfulCount { get; set; }
  public ICollection<ProductReviewHelpfulVote> HelpfulVotes { get; set; } = new List<ProductReviewHelpfulVote>();
  public DateTime PurchasedAtUtc { get; set; }
  public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
