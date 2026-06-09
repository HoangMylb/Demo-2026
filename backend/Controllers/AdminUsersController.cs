using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Services;
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

  [HttpPost]
  public async Task<ActionResult<AdminUserDto>> CreateUser([FromBody] CreateAdminUserDto request)
  {
    var fullName = request.FullName.Trim();
    var normalizedEmail = request.Email.Trim().ToLowerInvariant();
    var normalizedUserName = request.UserName.Trim().ToLowerInvariant();
    var normalizedRole = request.Role.Trim();

    if (string.IsNullOrWhiteSpace(fullName))
    {
      return this.ApiBadRequest("Full name is required.");
    }

    if (string.IsNullOrWhiteSpace(normalizedEmail))
    {
      return this.ApiBadRequest("Email is required.");
    }

    if (string.IsNullOrWhiteSpace(normalizedUserName))
    {
      return this.ApiBadRequest("Username is required.");
    }

    if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Trim().Length < 6)
    {
      return this.ApiBadRequest("Password must be at least 6 characters long.");
    }

    if (normalizedRole != "Admin" && normalizedRole != "User")
    {
      return this.ApiBadRequest("Role must be Admin or User.");
    }

    var emailTaken = await _context.Users.AnyAsync(item => item.Email.ToLower() == normalizedEmail);
    if (emailTaken)
    {
      return this.ApiConflict("This email is already in use.");
    }

    var userNameTaken = await _context.Users.AnyAsync(item => item.UserName.ToLower() == normalizedUserName);
    if (userNameTaken)
    {
      return this.ApiConflict("This username is already in use.");
    }

    var user = new Backend.Models.User
    {
      FullName = fullName,
      UserName = normalizedUserName,
      Email = normalizedEmail,
      PasswordHash = PasswordHasher.HashPassword(request.Password.Trim()),
      Role = normalizedRole,
      IsApproved = true,
      IsLocked = false,
    };

    _context.Users.Add(user);
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
    ), "User created successfully.");
  }

  [HttpPatch("{id:int}/access")]
  public async Task<ActionResult<AdminUserDto>> UpdateUserAccess(int id, [FromBody] UpdateUserAccessDto request)
  {
    var user = await _context.Users.FirstOrDefaultAsync(item => item.Id == id);
    if (user is null)
    {
      return this.ApiNotFound("The requested user was not found.");
    }

    var currentAdminEmail = User.GetUserEmail();
    var isCurrentAdmin = !string.IsNullOrWhiteSpace(currentAdminEmail) && string.Equals(user.Email, currentAdminEmail, StringComparison.OrdinalIgnoreCase);

    if (!string.IsNullOrWhiteSpace(request.Email))
    {
      var normalizedEmail = request.Email.Trim().ToLowerInvariant();
      var emailTaken = await _context.Users.AnyAsync(item => item.Id != id && item.Email.ToLower() == normalizedEmail);
      if (emailTaken)
      {
        return this.ApiConflict("This email is already in use.");
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
        return this.ApiConflict("This username is already in use.");
      }

      user.UserName = normalizedUserName;
    }

    if (!string.IsNullOrWhiteSpace(request.Role))
    {
      var normalizedRole = request.Role.Trim();
      if (normalizedRole != "Admin" && normalizedRole != "User")
      {
        return this.ApiBadRequest("Role must be Admin or User.");
      }

      if (isCurrentAdmin && normalizedRole != "Admin")
      {
        return this.ApiBadRequest("You cannot remove your own admin role.");
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
      return this.ApiNotFound("The requested user was not found.");
    }

    var currentAdminEmail = User.GetUserEmail();
    if (!string.IsNullOrWhiteSpace(currentAdminEmail) && string.Equals(user.Email, currentAdminEmail, StringComparison.OrdinalIgnoreCase))
    {
      return this.ApiBadRequest("You cannot delete your own admin account.");
    }

    _context.Users.Remove(user);
    await _context.SaveChangesAsync();

    return this.ApiOk<object?>(null, "User deleted successfully.");
  }
}
