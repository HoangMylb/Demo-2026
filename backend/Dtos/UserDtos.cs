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

public record LoginRequestDto(
  string Email,
  string Password
);

public record LoginResponseDto(
  string Token,
  string Email,
  string UserName,
  string Role
);

public record RegisterRequestDto(
  string FullName,
  string Email,
  string Password
);

public class UpdateUserAccessDto
{
  public bool? IsLocked { get; set; }
  public bool? IsApproved { get; set; }
}
