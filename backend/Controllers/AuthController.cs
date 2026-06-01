using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
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
  private const string AuthCookieName = "demo2026_auth";

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

    var token = CreateJwt(user);
    var serializedToken = new JwtSecurityTokenHandler().WriteToken(token);
    Response.Cookies.Append(AuthCookieName, serializedToken, BuildCookieOptions(token.ValidTo));

    return this.ApiOk(new LoginResponseDto(
      user.Email,
      user.UserName,
      user.Role
    ));
  }

  [Authorize]
  [HttpGet("me")]
  public ActionResult<SessionDto> Me()
  {
    if (User.Identity?.IsAuthenticated != true)
    {
      return Unauthorized();
    }

    var email = User.GetUserEmail();
    var userName = User.GetUserName();
    var role = User.GetUserRole();

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(role))
    {
      return Unauthorized();
    }

    return this.ApiOk(new SessionDto(email, userName, role));
  }

  [Authorize]
  [HttpPost("logout")]
  public IActionResult Logout()
  {
    Response.Cookies.Delete(AuthCookieName, BuildCookieOptions(DateTimeOffset.UtcNow));
    return NoContent();
  }

  private JwtSecurityToken CreateJwt(Backend.Models.User user)
  {
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

    return new JwtSecurityToken(
      issuer: issuer,
      audience: audience,
      claims: claims,
      expires: DateTime.UtcNow.AddHours(8),
      signingCredentials: signingCredentials
    );
  }

  private static CookieOptions BuildCookieOptions(DateTimeOffset expiresAt) => new()
  {
    HttpOnly = true,
    Secure = true,
    SameSite = SameSiteMode.None,
    Expires = expiresAt,
    Path = "/"
  };
}
