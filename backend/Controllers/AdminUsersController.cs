using Backend.Data;
using Backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  [HttpGet]
  public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetUsers()
  {
    var users = await _context.Users
      .AsNoTracking()
      .OrderByDescending(user => user.CreatedAtUtc)
      .Select(user => new AdminUserDto(
        user.Id,
        user.FullName,
        user.UserName,
        user.Email,
        user.Role,
        user.IsLocked,
        user.IsApproved,
        user.CreatedAtUtc
      ))
      .ToListAsync();

    return Ok(users);
  }

  [HttpPatch("{id:int}/access")]
  public async Task<ActionResult<AdminUserDto>> UpdateUserAccess(int id, [FromBody] UpdateUserAccessDto request)
  {
    var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id);
    if (user is null)
    {
      return NotFound();
    }

    if (request.IsLocked.HasValue)
    {
      user.IsLocked = request.IsLocked.Value;
    }

    if (request.IsApproved.HasValue)
    {
      user.IsApproved = request.IsApproved.Value;
    }

    await _context.SaveChangesAsync();

    return Ok(new AdminUserDto(
      user.Id,
      user.FullName,
      user.UserName,
      user.Email,
      user.Role,
      user.IsLocked,
      user.IsApproved,
      user.CreatedAtUtc
    ));
  }
}
