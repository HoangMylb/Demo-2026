namespace Backend.Models;

public class ProductReviewHelpfulVote
{
  public int Id { get; set; }
  public int ProductReviewId { get; set; }
  public ProductReview? ProductReview { get; set; }
  public int UserId { get; set; }
  public User? User { get; set; }
  public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
