namespace Backend.Dtos;

public record ApiResponseDto<T>(
  int Code,
  string Message,
  T Data
);
