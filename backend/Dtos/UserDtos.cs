namespace Backend.Dtos;

public record AdminUserDto(
  int Id,
  string FullName,
  string UserName,
  string Email,
  string Role,
  bool IsLocked,
  bool IsApproved,
  DateTime CreatedAtUtc
);

public record ProfileDto(
  int Id,
  string FullName,
  string UserName,
  string Email,
  string PhoneNumber,
  string Address,
  string Role,
  bool IsLocked,
  bool IsApproved,
  DateTime CreatedAtUtc
);

public record LoginRequestDto(
  string Email,
  string Password
);

public record LoginResponseDto(
  string Email,
  string UserName,
  string Role
);

public record SessionDto(
  string Email,
  string UserName,
  string Role
);

public record AuthProviderAvailabilityDto(
  bool Google,
  bool Facebook
);

public record RegisterRequestDto(
  string FullName,
  string Email,
  string Password
);

public record CreateAdminUserDto(
  string FullName,
  string UserName,
  string Email,
  string Password,
  string Role
);

public class UpdateUserAccessDto
{
  public string? FullName { get; set; }
  public string? UserName { get; set; }
  public string? Email { get; set; }
  public string? Role { get; set; }
  public bool? IsLocked { get; set; }
  public bool? IsApproved { get; set; }
}

public class UpdateProfileDto
{
  public string FullName { get; set; } = string.Empty;
  public string UserName { get; set; } = string.Empty;
  public string Email { get; set; } = string.Empty;
  public string PhoneNumber { get; set; } = string.Empty;
  public string Address { get; set; } = string.Empty;
}
