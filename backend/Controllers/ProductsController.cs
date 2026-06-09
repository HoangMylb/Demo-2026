using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  private static ProductReviewDto MapReviewDto(Product product, ProductReview review, int? currentUserId)
  {
    return new ProductReviewDto(
      review.Id,
      review.UserId,
      review.CustomerName,
      review.Rating,
      review.Comment,
      product.Name,
      product.Category?.Name ?? string.Empty,
      review.VariantType,
      review.Color,
      review.Size,
      review.HelpfulCount,
      currentUserId.HasValue && review.UserId == currentUserId.Value,
      currentUserId.HasValue && review.HelpfulVotes.Any(vote => vote.UserId == currentUserId.Value),
      review.PurchasedAtUtc,
      review.CreatedAtUtc
    );
  }

  private async Task<User?> GetCurrentUserAsync()
  {
    var userEmail = User.GetUserEmail();
    if (string.IsNullOrWhiteSpace(userEmail)) {
      return null;
    }

    return await _context.Users.FirstOrDefaultAsync(item => item.Email.ToLower() == userEmail.ToLower());
  }

  private static bool IsValidReviewPayload(int rating, string comment, string variantType, string color, string size, out string? errorMessage)
  {
    if (rating < 1 || rating > 5)
    {
      errorMessage = "Rating must be between 1 and 5.";
      return false;
    }

    if (string.IsNullOrWhiteSpace(comment))
    {
      errorMessage = "Comment is required.";
      return false;
    }

    if (string.IsNullOrWhiteSpace(variantType) || string.IsNullOrWhiteSpace(color) || string.IsNullOrWhiteSpace(size))
    {
      errorMessage = "Variant type, color, and size are required.";
      return false;
    }

    errorMessage = null;
    return true;
  }

  private static ProductListItemDto MapProductListItemDto(Product product)
  {
    var reviewCount = product.Reviews.Count;
    var averageRating = reviewCount == 0 ? 0m : Math.Round((decimal)product.Reviews.Average(review => review.Rating), 1);

    return new ProductListItemDto(
      product.Id,
      product.Name,
      product.Description,
      product.Price,
      product.ImageUrl,
      product.CategoryId,
      product.Category?.Name ?? string.Empty,
      averageRating,
      reviewCount,
      product.CreatedAtUtc,
      product.UpdatedAtUtc
    );
  }

  [HttpGet]
  public async Task<ActionResult<IEnumerable<ProductListItemDto>>> GetProducts()
  {
    var products = await _context.Products
      .AsNoTracking()
      .Include(product => product.Category)
      .Include(product => product.Reviews)
      .OrderByDescending(product => product.CreatedAtUtc)
      .ToListAsync();

    return this.ApiOk(products.Select(MapProductListItemDto).ToList());
  }

  [HttpGet("{id:int}")]
  public async Task<ActionResult<ProductDetailDto>> GetProductById(int id)
  {
    var currentUser = await GetCurrentUserAsync();

    var product = await _context.Products
      .AsNoTracking()
      .Include(item => item.Category)
      .Include(item => item.Reviews)
      .ThenInclude(review => review.HelpfulVotes)
      .FirstOrDefaultAsync(item => item.Id == id);

    if (product is null)
    {
      return this.ApiNotFound("The requested product was not found.");
    }

    var relatedProducts = await _context.Products
      .AsNoTracking()
      .Include(item => item.Category)
      .Include(item => item.Reviews)
      .Where(item => item.CategoryId == product.CategoryId && item.Id != product.Id)
      .OrderByDescending(item => item.CreatedAtUtc)
      .Take(4)
      .ToListAsync();

    var reviewCount = product.Reviews.Count;
    var averageRating = reviewCount == 0 ? 0m : Math.Round((decimal)product.Reviews.Average(review => review.Rating), 1);

    var detail = new ProductDetailDto(
      product.Id,
      product.Name,
      product.Description,
      product.Price,
      product.ImageUrl,
      product.CategoryId,
      product.Category?.Name ?? string.Empty,
      averageRating,
      reviewCount,
      product.Reviews
        .OrderByDescending(review => review.CreatedAtUtc)
        .Select(review => MapReviewDto(product, review, currentUser?.Id))
        .ToList(),
      relatedProducts.Select(MapProductListItemDto).ToList(),
      product.CreatedAtUtc,
      product.UpdatedAtUtc
    );

    return this.ApiOk(detail);
  }

  [Authorize]
  [HttpPost("{id:int}/reviews")]
  public async Task<ActionResult<ProductReviewDto>> CreateReview(int id, [FromBody] CreateProductReviewDto request)
  {
    var user = await GetCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    var product = await _context.Products
      .Include(item => item.Category)
      .FirstOrDefaultAsync(item => item.Id == id);

    if (product is null)
    {
      return this.ApiNotFound("The requested product was not found.");
    }

    if (user.IsLocked || !user.IsApproved)
    {
      return this.ApiError(403, "Your account cannot submit reviews right now.");
    }

    if (!IsValidReviewPayload(request.Rating, request.Comment, request.VariantType, request.Color, request.Size, out var validationError))
    {
      return this.ApiBadRequest(validationError ?? "Review payload is invalid.");
    }

    var existingReview = await _context.ProductReviews.FirstOrDefaultAsync(item => item.ProductId == id && item.UserId == user.Id);
    if (existingReview is not null)
    {
      return this.ApiConflict("You have already reviewed this product.");
    }

    var review = new ProductReview
    {
      ProductId = product.Id,
      UserId = user.Id,
      CustomerName = user.FullName,
      Rating = request.Rating,
      Comment = request.Comment.Trim(),
      VariantType = request.VariantType.Trim(),
      Color = request.Color.Trim(),
      Size = request.Size.Trim(),
      HelpfulCount = 0,
      PurchasedAtUtc = DateTime.UtcNow,
      CreatedAtUtc = DateTime.UtcNow,
    };

    _context.ProductReviews.Add(review);
    await _context.SaveChangesAsync();

    return this.ApiCreatedAtAction(nameof(GetProductById), new { id = product.Id }, MapReviewDto(product, review, user.Id));
  }

  [Authorize]
  [HttpPut("{productId:int}/reviews/{reviewId:int}")]
  public async Task<ActionResult<ProductReviewDto>> UpdateReview(int productId, int reviewId, [FromBody] UpdateProductReviewDto request)
  {
    var user = await GetCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    var review = await _context.ProductReviews
      .Include(item => item.Product)
      .ThenInclude(product => product!.Category)
      .Include(item => item.HelpfulVotes)
      .FirstOrDefaultAsync(item => item.Id == reviewId && item.ProductId == productId);

    if (review is null || review.Product is null)
    {
      return this.ApiNotFound("The requested review was not found.");
    }

    if (review.UserId != user.Id)
    {
      return this.ApiError(403, "You can only edit your own review.");
    }

    if (!IsValidReviewPayload(request.Rating, request.Comment, request.VariantType, request.Color, request.Size, out var validationError))
    {
      return this.ApiBadRequest(validationError ?? "Review payload is invalid.");
    }

    review.Rating = request.Rating;
    review.Comment = request.Comment.Trim();
    review.VariantType = request.VariantType.Trim();
    review.Color = request.Color.Trim();
    review.Size = request.Size.Trim();

    await _context.SaveChangesAsync();

    return this.ApiOk(MapReviewDto(review.Product, review, user.Id));
  }

  [Authorize]
  [HttpDelete("{productId:int}/reviews/{reviewId:int}")]
  public async Task<IActionResult> DeleteReview(int productId, int reviewId)
  {
    var user = await GetCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    var review = await _context.ProductReviews.FirstOrDefaultAsync(item => item.Id == reviewId && item.ProductId == productId);
    if (review is null)
    {
      return this.ApiNotFound("The requested review was not found.");
    }

    if (review.UserId != user.Id)
    {
      return this.ApiError(403, "You can only delete your own review.");
    }

    _context.ProductReviews.Remove(review);
    await _context.SaveChangesAsync();

    return this.ApiOk<object?>(null, "Review deleted successfully.");
  }

  [Authorize]
  [HttpPost("{productId:int}/reviews/{reviewId:int}/helpful")]
  public async Task<ActionResult<ProductReviewHelpfulResponseDto>> ToggleHelpfulVote(int productId, int reviewId)
  {
    var user = await GetCurrentUserAsync();
    if (user is null)
    {
      return this.ApiUnauthorized();
    }

    var review = await _context.ProductReviews
      .Include(item => item.HelpfulVotes)
      .FirstOrDefaultAsync(item => item.Id == reviewId && item.ProductId == productId);

    if (review is null)
    {
      return this.ApiNotFound("The requested review was not found.");
    }

    if (review.UserId == user.Id)
    {
      return this.ApiBadRequest("You cannot mark your own review as helpful.");
    }

    var existingVote = review.HelpfulVotes.FirstOrDefault(item => item.UserId == user.Id);
    bool hasMarkedHelpful;

    if (existingVote is null)
    {
      var vote = new ProductReviewHelpfulVote
      {
        ProductReviewId = review.Id,
        UserId = user.Id,
        CreatedAtUtc = DateTime.UtcNow,
      };

      _context.ProductReviewHelpfulVotes.Add(vote);
      review.HelpfulCount += 1;
      hasMarkedHelpful = true;
    }
    else
    {
      _context.ProductReviewHelpfulVotes.Remove(existingVote);
      review.HelpfulCount = Math.Max(0, review.HelpfulCount - 1);
      hasMarkedHelpful = false;
    }

    await _context.SaveChangesAsync();

    return this.ApiOk(new ProductReviewHelpfulResponseDto(review.Id, review.HelpfulCount, hasMarkedHelpful));
  }
}
