using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Dtos;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext context, IConfiguration configuration) : ControllerBase
{
  private readonly AppDbContext _context = context;
  private readonly IConfiguration _configuration = configuration;

  [HttpPost("register")]
  public async Task<ActionResult<LoginResponseDto>> Register([FromBody] RegisterRequestDto request)
  {
    var normalizedEmail = request.Email.Trim().ToLowerInvariant();
    var normalizedUserName = normalizedEmail.Split('@')[0].Trim().ToLowerInvariant();

    var emailExists = await _context.Users.AnyAsync(item => item.Email.ToLower() == normalizedEmail);
    if (emailExists)
    {
      return Conflict(new { message = "This email is already registered." });
    }

    var userNameExists = await _context.Users.AnyAsync(item => item.UserName.ToLower() == normalizedUserName);
    if (userNameExists)
    {
      return Conflict(new { message = "A user with this username already exists." });
    }

    var user = new Backend.Models.User
    {
      FullName = request.FullName.Trim(),
      UserName = normalizedUserName,
      Email = normalizedEmail,
      PasswordHash = PasswordHasher.HashPassword(request.Password),
      Role = "User",
      IsApproved = true,
      IsLocked = false
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    return await Login(new LoginRequestDto(user.Email, request.Password));
  }

  [HttpPost("login")]
  public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
  {
    var normalizedEmail = request.Email.Trim().ToLowerInvariant();

    var user = await _context.Users.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail);
    if (user is null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
    {
      return Unauthorized(new { message = "Invalid email or password." });
    }

    if (user.IsLocked)
    {
      return Forbid();
    }

    var jwtSection = _configuration.GetSection("Jwt");
    var issuer = jwtSection["Issuer"] ?? "PortfolioAdmin";
    var audience = jwtSection["Audience"] ?? "PortfolioAdminClient";
    var key = jwtSection["Key"] ?? throw new InvalidOperationException("JWT signing key is missing.");

    var claims = new[]
    {
      new Claim(JwtRegisteredClaimNames.Sub, user.Email),
      new Claim(JwtRegisteredClaimNames.Email, user.Email),
      new Claim(ClaimTypes.Name, user.UserName),
      new Claim(ClaimTypes.Role, user.Role)
    };

    var signingCredentials = new SigningCredentials(
      new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
      SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
      issuer: issuer,
      audience: audience,
      claims: claims,
      expires: DateTime.UtcNow.AddHours(8),
      signingCredentials: signingCredentials
    );

    return Ok(new LoginResponseDto(
      new JwtSecurityTokenHandler().WriteToken(token),
      user.Email,
      user.UserName,
      user.Role
    ));
  }
}
