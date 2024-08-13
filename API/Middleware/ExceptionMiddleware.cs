using System.Net;
using System.Text.Json;

namespace API;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context) // This is what is called when next() is called on a middleware. The name is standard.
    {
        try
        {
            await next(context);
        }
        catch ( Exception ex )
        {
            logger.LogError(ex, ex.Message);
            context.Response.ContentType = "application/json"; // Don't understant this string. Is it standard?
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var response = env.IsDevelopment() ? 
                new ApiException(context.Response.StatusCode, ex.Message, ex.StackTrace) :
                new ApiException(context.Response.StatusCode, ex.Message, "Internal Server Error");
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var json = JsonSerializer.Serialize(response, options);
            await context.Response.WriteAsync(json);
        }
    }
}
