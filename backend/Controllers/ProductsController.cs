using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<ProductListItemDto>>> GetProducts()
  {
    var products = await _context.Products
      .AsNoTracking()
      .Include(product => product.Category)
      .OrderByDescending(product => product.CreatedAtUtc)
      .Select(product => new ProductListItemDto(
        product.Id,
        product.Name,
        product.Description,
        product.Price,
        product.ImageUrl,
        product.CategoryId,
        product.Category != null ? product.Category.Name : string.Empty,
        product.CreatedAtUtc,
        product.UpdatedAtUtc
      ))
      .ToListAsync();

    return this.ApiOk(products);
  }

  [HttpGet("{id:int}")]
  public async Task<ActionResult<ProductListItemDto>> GetProductById(int id)
  {
    var product = await _context.Products
      .AsNoTracking()
      .Include(item => item.Category)
      .Where(item => item.Id == id)
      .Select(item => new ProductListItemDto(
        item.Id,
        item.Name,
        item.Description,
        item.Price,
        item.ImageUrl,
        item.CategoryId,
        item.Category != null ? item.Category.Name : string.Empty,
        item.CreatedAtUtc,
        item.UpdatedAtUtc
      ))
      .FirstOrDefaultAsync();

    return product is null ? this.ApiNotFound("The requested product was not found.") : this.ApiOk(product);
  }
}
