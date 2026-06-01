using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController(AppDbContext context) : ControllerBase
{
  private readonly AppDbContext _context = context;

  [HttpGet]
  public async Task<ActionResult<ProfileDto>> GetProfile()
  {
    var user = await FindCurrentUserAsync();
    if (user is null)
    {
      return Unauthorized();
    }

    return this.ApiOk(MapProfile(user));
  }

  [HttpPut]
  public async Task<ActionResult<ProfileDto>> UpdateProfile([FromBody] UpdateProfileDto request)
  {
    var user = await FindCurrentUserAsync();
    if (user is null)
    {
      return Unauthorized();
    }

    var normalizedEmail = request.Email.Trim().ToLowerInvariant();
    var normalizedUserName = request.UserName.Trim().ToLowerInvariant();

    var emailTaken = await _context.Users.AnyAsync(item => item.Id != user.Id && item.Email.ToLower() == normalizedEmail);
    if (emailTaken)
    {
      return Conflict(new { message = "This email is already in use." });
    }

    var userNameTaken = await _context.Users.AnyAsync(item => item.Id != user.Id && item.UserName.ToLower() == normalizedUserName);
    if (userNameTaken)
    {
      return Conflict(new { message = "This username is already in use." });
    }

    user.FullName = request.FullName.Trim();
    user.UserName = normalizedUserName;
    user.Email = normalizedEmail;

    await _context.SaveChangesAsync();

    return this.ApiOk(MapProfile(user));
  }

  private async Task<Backend.Models.User?> FindCurrentUserAsync()
  {
    var email = User.GetUserEmail();
    if (string.IsNullOrWhiteSpace(email))
    {
      return null;
    }

    var normalizedEmail = email.Trim().ToLowerInvariant();
    return await _context.Users.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail || item.UserName.ToLower() == normalizedEmail);
  }

  private static ProfileDto MapProfile(Backend.Models.User user) => new(
    user.Id,
    user.FullName,
    user.UserName,
    user.Email,
    user.Role,
    user.IsLocked,
    user.IsApproved,
    user.CreatedAtUtc
  );
}
