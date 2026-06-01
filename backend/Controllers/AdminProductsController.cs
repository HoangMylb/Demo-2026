using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController(AppDbContext context) : ControllerBase
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

  [HttpPost]
  public async Task<ActionResult<ProductListItemDto>> CreateProduct([FromBody] UpsertProductDto request)
  {
    var categoryExists = await _context.Categories.AnyAsync(category => category.Id == request.CategoryId);
    if (!categoryExists)
    {
      return this.ApiBadRequest("Category does not exist.");
    }

    var product = new Product
    {
      Name = request.Name,
      Description = request.Description,
      Price = request.Price,
      ImageUrl = request.ImageUrl,
      CategoryId = request.CategoryId,
      CreatedAtUtc = DateTime.UtcNow,
      UpdatedAtUtc = DateTime.UtcNow
    };

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    var createdProduct = await _context.Products
      .AsNoTracking()
      .Include(item => item.Category)
      .Where(item => item.Id == product.Id)
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
      .FirstAsync();

    return this.ApiCreatedAtAction(nameof(GetProductById), new { id = createdProduct.Id }, createdProduct);
  }

  [HttpPut("{id:int}")]
  public async Task<ActionResult<ProductListItemDto>> UpdateProduct(int id, [FromBody] UpsertProductDto request)
  {
    var product = await _context.Products.FirstOrDefaultAsync(item => item.Id == id);
    if (product is null)
    {
      return this.ApiNotFound("The requested product was not found.");
    }

    var categoryExists = await _context.Categories.AnyAsync(category => category.Id == request.CategoryId);
    if (!categoryExists)
    {
      return this.ApiBadRequest("Category does not exist.");
    }

    product.Name = request.Name;
    product.Description = request.Description;
    product.Price = request.Price;
    product.ImageUrl = request.ImageUrl;
    product.CategoryId = request.CategoryId;
    product.UpdatedAtUtc = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    var updatedProduct = await _context.Products
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
      .FirstAsync();

    return this.ApiOk(updatedProduct);
  }

  [HttpDelete("{id:int}")]
  public async Task<IActionResult> DeleteProduct(int id)
  {
    var product = await _context.Products.FirstOrDefaultAsync(item => item.Id == id);
    if (product is null)
    {
      return this.ApiNotFound("The requested product was not found.");
    }

    _context.Products.Remove(product);
    await _context.SaveChangesAsync();

    return this.ApiOk<object?>(null, "Product deleted successfully.");
  }
}
