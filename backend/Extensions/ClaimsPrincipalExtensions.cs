using System.Security.Claims;

namespace Backend.Extensions;

public static class ClaimsPrincipalExtensions
{
  public static string? GetUserEmail(this ClaimsPrincipal user) =>
    user.FindFirstValue(ClaimTypes.Email)
    ?? user.FindFirstValue("email")
    ?? user.FindFirstValue("sub");

  public static string? GetUserName(this ClaimsPrincipal user) =>
    user.FindFirstValue(ClaimTypes.Name)
    ?? user.FindFirstValue("unique_name")
    ?? user.FindFirstValue("name");

  public static string? GetUserRole(this ClaimsPrincipal user) =>
    user.FindFirstValue(ClaimTypes.Role)
    ?? user.FindFirstValue("role");
}
