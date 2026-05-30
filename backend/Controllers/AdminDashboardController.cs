using Backend.Data;
using Backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  [HttpGet("stats")]
  public async Task<ActionResult<AdminStatsDto>> GetStats()
  {
    var totalUsers = await _context.Users.CountAsync();
    var totalProducts = await _context.Products.CountAsync();

    return Ok(new AdminStatsDto(totalUsers, totalProducts));
  }
}
