using Backend.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Extensions;

public static class ControllerBaseExtensions
{
  public static OkObjectResult ApiOk<T>(this ControllerBase controller, T data, string message = "Submit thành công") =>
    controller.Ok(new ApiResponseDto<T>(0, message, data));

  public static CreatedAtActionResult ApiCreatedAtAction<T>(
    this ControllerBase controller,
    string actionName,
    object? routeValues,
    T data,
    string message = "Submit thành công") =>
    controller.CreatedAtAction(actionName, routeValues, new ApiResponseDto<T>(0, message, data));
}
