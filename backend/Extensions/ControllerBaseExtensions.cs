using Backend.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Extensions;

public static class ControllerBaseExtensions
{
  public static OkObjectResult ApiOk<T>(this ControllerBase controller, T data, string message = "Request completed successfully") =>
    controller.Ok(new ApiResponseDto<T>(0, message, data));

  public static ObjectResult ApiError(this ControllerBase controller, int statusCode, string message, int code = 1) =>
    controller.StatusCode(statusCode, new ApiResponseDto<object?>(code, message, null));

  public static BadRequestObjectResult ApiBadRequest(this ControllerBase controller, string message, int code = 1) =>
    controller.BadRequest(new ApiResponseDto<object?>(code, message, null));

  public static ConflictObjectResult ApiConflict(this ControllerBase controller, string message, int code = 1) =>
    controller.Conflict(new ApiResponseDto<object?>(code, message, null));

  public static NotFoundObjectResult ApiNotFound(this ControllerBase controller, string message = "The requested resource was not found.", int code = 1) =>
    controller.NotFound(new ApiResponseDto<object?>(code, message, null));

  public static UnauthorizedObjectResult ApiUnauthorized(this ControllerBase controller, string message = "You are not authorized to perform this request.", int code = 1) =>
    controller.Unauthorized(new ApiResponseDto<object?>(code, message, null));

  public static CreatedAtActionResult ApiCreatedAtAction<T>(
    this ControllerBase controller,
    string actionName,
    object? routeValues,
    T data,
    string message = "Request completed successfully") =>
    controller.CreatedAtAction(actionName, routeValues, new ApiResponseDto<T>(0, message, data));
}
