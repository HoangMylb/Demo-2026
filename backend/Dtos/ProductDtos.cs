namespace Backend.Dtos;

public record ProductListItemDto(
  int Id,
  string Name,
  string Description,
  decimal Price,
  string ImageUrl,
  int CategoryId,
  string CategoryName,
  decimal AverageRating,
  int ReviewCount,
  DateTime CreatedAtUtc,
  DateTime UpdatedAtUtc
);

public record ProductReviewDto(
  int Id,
  int UserId,
  string CustomerName,
  int Rating,
  string Comment,
  string ProductName,
  string CategoryName,
  string VariantType,
  string Color,
  string Size,
  int HelpfulCount,
  bool IsCurrentUserReview,
  bool HasCurrentUserMarkedHelpful,
  DateTime PurchasedAtUtc,
  DateTime CreatedAtUtc
);

public record ProductReviewHelpfulResponseDto(
  int ReviewId,
  int HelpfulCount,
  bool HasCurrentUserMarkedHelpful
);

public record AdminProductReviewDto(
  int Id,
  int ProductId,
  string ProductName,
  string CategoryName,
  int UserId,
  string CustomerName,
  int Rating,
  string Comment,
  string VariantType,
  string Color,
  string Size,
  int HelpfulCount,
  DateTime PurchasedAtUtc,
  DateTime CreatedAtUtc
);

public class CreateProductReviewDto
{
  public int Rating { get; set; }
  public string Comment { get; set; } = string.Empty;
  public string VariantType { get; set; } = string.Empty;
  public string Color { get; set; } = string.Empty;
  public string Size { get; set; } = string.Empty;
}

public class UpdateProductReviewDto
{
  public int Rating { get; set; }
  public string Comment { get; set; } = string.Empty;
  public string VariantType { get; set; } = string.Empty;
  public string Color { get; set; } = string.Empty;
  public string Size { get; set; } = string.Empty;
}

public record ProductDetailDto(
  int Id,
  string Name,
  string Description,
  decimal Price,
  string ImageUrl,
  int CategoryId,
  string CategoryName,
  decimal AverageRating,
  int ReviewCount,
  IReadOnlyList<ProductReviewDto> Reviews,
  IReadOnlyList<ProductListItemDto> RelatedProducts,
  DateTime CreatedAtUtc,
  DateTime UpdatedAtUtc
);

public class UpsertProductDto
{
  public string Name { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public decimal Price { get; set; }
  public string ImageUrl { get; set; } = string.Empty;
  public int CategoryId { get; set; }
}
