using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
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

    return this.ApiOk(users);
  }

  [HttpPatch("{id:int}/access")]
  public async Task<ActionResult<AdminUserDto>> UpdateUserAccess(int id, [FromBody] UpdateUserAccessDto request)
  {
    var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id);
    if (user is null)
    {
      return NotFound();
    }

    if (!string.IsNullOrWhiteSpace(request.Email))
    {
      var normalizedEmail = request.Email.Trim().ToLowerInvariant();
      var emailTaken = await _context.Users.AnyAsync(item => item.Id != id && item.Email.ToLower() == normalizedEmail);
      if (emailTaken)
      {
        return Conflict(new { message = "This email is already in use." });
      }

      user.Email = normalizedEmail;
    }

    if (!string.IsNullOrWhiteSpace(request.FullName))
    {
      user.FullName = request.FullName.Trim();
    }

    if (!string.IsNullOrWhiteSpace(request.UserName))
    {
      var normalizedUserName = request.UserName.Trim().ToLowerInvariant();
      var userNameTaken = await _context.Users.AnyAsync(item => item.Id != id && item.UserName.ToLower() == normalizedUserName);
      if (userNameTaken)
      {
        return Conflict(new { message = "This username is already in use." });
      }

      user.UserName = normalizedUserName;
    }

    if (!string.IsNullOrWhiteSpace(request.Role))
    {
      var normalizedRole = request.Role.Trim();
      if (normalizedRole != "Admin" && normalizedRole != "User")
      {
        return BadRequest(new { message = "Role must be Admin or User." });
      }

      user.Role = normalizedRole;
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

    return this.ApiOk(new AdminUserDto(
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

  [HttpDelete("{id:int}")]
  public async Task<IActionResult> DeleteUser(int id)
  {
    var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id);
    if (user is null)
    {
      return NotFound();
    }

    _context.Users.Remove(user);
    await _context.SaveChangesAsync();

    return NoContent();
  }
}
