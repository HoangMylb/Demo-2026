namespace Backend.Dtos;

public record ProductListItemDto(
  int Id,
  string Name,
  string Description,
  decimal Price,
  string ImageUrl,
  int CategoryId,
  string CategoryName,
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
