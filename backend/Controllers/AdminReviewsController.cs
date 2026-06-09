using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/admin/reviews")]
[Authorize(Roles = "Admin")]
public class AdminReviewsController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<AdminProductReviewDto>>> GetReviews()
  {
    var reviews = await _context.ProductReviews
      .AsNoTracking()
      .Include(review => review.Product)
      .ThenInclude(product => product!.Category)
      .OrderByDescending(review => review.CreatedAtUtc)
      .Select(review => new AdminProductReviewDto(
        review.Id,
        review.ProductId,
        review.Product != null ? review.Product.Name : string.Empty,
        review.Product != null && review.Product.Category != null ? review.Product.Category.Name : string.Empty,
        review.UserId,
        review.CustomerName,
        review.Rating,
        review.Comment,
        review.VariantType,
        review.Color,
        review.Size,
        review.HelpfulCount,
        review.PurchasedAtUtc,
        review.CreatedAtUtc
      ))
      .ToListAsync();

    return this.ApiOk(reviews);
  }

  [HttpDelete("{id:int}")]
  public async Task<IActionResult> DeleteReview(int id)
  {
    var review = await _context.ProductReviews.FirstOrDefaultAsync(item => item.Id == id);
    if (review is null)
    {
      return this.ApiNotFound("The requested review was not found.");
    }

    _context.ProductReviews.Remove(review);
    await _context.SaveChangesAsync();

    return this.ApiOk<object?>(null, "Review deleted successfully.");
  }
}
