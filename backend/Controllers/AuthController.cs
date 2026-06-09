using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.Dtos;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext context, IConfiguration configuration, IWebHostEnvironment environment) : ControllerBase
{
  private readonly AppDbContext _context = context;
  private readonly IConfiguration _configuration = configuration;
  private readonly IWebHostEnvironment _environment = environment;
  private const string AuthCookieName = "demo2026_auth";

  [HttpGet("providers")]
  public ActionResult<AuthProviderAvailabilityDto> GetProviderAvailability()
  {
    var googleEnabled = !string.IsNullOrWhiteSpace(_configuration["Authentication:Google:ClientId"])
      && !string.IsNullOrWhiteSpace(_configuration["Authentication:Google:ClientSecret"]);
    var facebookEnabled = !string.IsNullOrWhiteSpace(_configuration["Authentication:Facebook:AppId"])
      && !string.IsNullOrWhiteSpace(_configuration["Authentication:Facebook:AppSecret"]);

    return this.ApiOk(new AuthProviderAvailabilityDto(googleEnabled, facebookEnabled));
  }

  [HttpGet("external/{provider}")]
  public IActionResult ExternalLogin([FromRoute] string provider, [FromQuery] string? returnUrl = null)
  {
    if (!string.Equals(provider, "Google", StringComparison.OrdinalIgnoreCase) && !string.Equals(provider, "Facebook", StringComparison.OrdinalIgnoreCase))
    {
      return this.ApiBadRequest("Unsupported external login provider.");
    }

    var callbackUrl = Url.Action(nameof(ExternalLoginCallback), new { provider, returnUrl = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl });
    if (string.IsNullOrWhiteSpace(callbackUrl))
    {
      return this.ApiError(500, "Unable to start external login flow.");
    }

    var properties = new AuthenticationProperties { RedirectUri = callbackUrl };
    return Challenge(properties, provider);
  }

  [HttpGet("external/{provider}/callback")]
  public async Task<IActionResult> ExternalLoginCallback([FromRoute] string provider, [FromQuery] string? returnUrl = null)
  {
    var result = await HttpContext.AuthenticateAsync("External");
    if (!result.Succeeded || result.Principal is null)
    {
      return Redirect(BuildFrontendRedirect($"/auth?error={Uri.EscapeDataString("Unable to authenticate with external provider.")}"));
    }

    var email = result.Principal.FindFirstValue(ClaimTypes.Email)
      ?? result.Principal.FindFirstValue("email")
      ?? result.Principal.FindFirstValue(JwtRegisteredClaimNames.Email);

    var displayName = result.Principal.FindFirstValue(ClaimTypes.Name)
      ?? result.Principal.FindFirstValue("name")
      ?? result.Principal.Identity?.Name;

    if (string.IsNullOrWhiteSpace(email))
    {
      await HttpContext.SignOutAsync("External");
      return Redirect(BuildFrontendRedirect($"/auth?error={Uri.EscapeDataString("The external provider did not return an email address.")}"));
    }

    var normalizedEmail = email.Trim().ToLowerInvariant();
    var normalizedUserName = normalizedEmail.Split('@')[0].Trim().ToLowerInvariant();
    var fallbackName = string.IsNullOrWhiteSpace(displayName) ? normalizedUserName : displayName.Trim();

    var user = await _context.Users.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail);
    if (user is null)
    {
      var userName = normalizedUserName;
      var suffix = 1;

      while (await _context.Users.AnyAsync(item => item.UserName.ToLower() == userName))
      {
        userName = $"{normalizedUserName}{suffix}";
        suffix += 1;
      }

      user = new Backend.Models.User
      {
        FullName = fallbackName,
        UserName = userName,
        Email = normalizedEmail,
        PasswordHash = PasswordHasher.HashPassword(Guid.NewGuid().ToString("N")),
        Role = "User",
        IsApproved = true,
        IsLocked = false,
      };

      _context.Users.Add(user);
      await _context.SaveChangesAsync();
    }

    if (user.IsLocked)
    {
      await HttpContext.SignOutAsync("External");
      return Redirect(BuildFrontendRedirect($"/auth?error={Uri.EscapeDataString("This account is locked or forbidden.")}"));
    }

    var token = CreateJwt(user);
    var serializedToken = new JwtSecurityTokenHandler().WriteToken(token);
    Response.Cookies.Append(AuthCookieName, serializedToken, BuildCookieOptions(token.ValidTo, _environment));
    await HttpContext.SignOutAsync("External");

    return Redirect(BuildFrontendRedirect(string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl));
  }

  [HttpPost("register")]
  public async Task<ActionResult<LoginResponseDto>> Register([FromBody] RegisterRequestDto request)
  {
    var normalizedEmail = request.Email.Trim().ToLowerInvariant();
    var normalizedUserName = normalizedEmail.Split('@')[0].Trim().ToLowerInvariant();

    var emailExists = await _context.Users.AnyAsync(item => item.Email.ToLower() == normalizedEmail);
    if (emailExists)
    {
      return this.ApiConflict("This email is already registered.");
    }

    var userNameExists = await _context.Users.AnyAsync(item => item.UserName.ToLower() == normalizedUserName);
    if (userNameExists)
    {
      return this.ApiConflict("A user with this username already exists.");
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
      return this.ApiUnauthorized("Invalid email or password.");
    }

    if (user.IsLocked)
    {
      return this.ApiError(403, "This account is locked or forbidden.");
    }

    var token = CreateJwt(user);
    var serializedToken = new JwtSecurityTokenHandler().WriteToken(token);
    Response.Cookies.Append(AuthCookieName, serializedToken, BuildCookieOptions(token.ValidTo, _environment));

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
      return this.ApiUnauthorized();
    }

    var email = User.GetUserEmail();
    var userName = User.GetUserName();
    var role = User.GetUserRole();

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(userName) || string.IsNullOrWhiteSpace(role))
    {
      return this.ApiUnauthorized();
    }

    return this.ApiOk(new SessionDto(email, userName, role));
  }

  [Authorize]
  [HttpPost("logout")]
  public IActionResult Logout()
  {
    Response.Cookies.Delete(AuthCookieName, BuildCookieOptions(DateTimeOffset.UtcNow, _environment));
    return this.ApiOk<object?>(null, "Logged out successfully.");
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

  private static CookieOptions BuildCookieOptions(DateTimeOffset expiresAt, IWebHostEnvironment environment) => new()
  {
    HttpOnly = true,
    Secure = !environment.IsDevelopment(),
    SameSite = environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
    Expires = expiresAt,
    Path = "/"
  };

  private string BuildFrontendRedirect(string path)
  {
    var configuredFrontendUrl = _configuration["Frontend:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(configuredFrontendUrl))
    {
      return $"{configuredFrontendUrl.TrimEnd('/')}{path}";
    }

    if (_environment.IsDevelopment())
    {
      return $"http://localhost:5173{path}";
    }

    return $"https://hoangmydemo.online{path}";
  }
}
