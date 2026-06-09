namespace Backend.Models;

public class User
{
  public int Id { get; set; }
  public string FullName { get; set; } = string.Empty;
  public string UserName { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string PasswordHash { get; set; } = string.Empty;
  public string Role { get; set; } = "User";
  public bool IsLocked { get; set; }
  public bool IsApproved { get; set; }
  public ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();
  public ICollection<ProductReviewHelpfulVote> ProductReviewHelpfulVotes { get; set; } = new List<ProductReviewHelpfulVote>();
  public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
