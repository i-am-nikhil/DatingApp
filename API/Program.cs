using API;
using API.Data;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors(corspolicybuilder => corspolicybuilder.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:4200"));


// app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Code to seed data into database. This needs to happen after MapControllers middleware.
using var scope = app.Services.CreateScope(); // This is outside of the scope of dependency injection.
//Hence we need to create this. We are using a service locator pattern here to locate the services we wish to use. Scope will go out of scope and hence all the service it provides.
var services = scope.ServiceProvider; // This is how services will be provided using the scope object.

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>(); // We are able to get UserManager service because we have added AddIdentityCore to our services in IdentityServiceExtensions,
    // which takes care of managing the UserManager as well.
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    await context.Database.MigrateAsync();

    Seed.SeedUsers(userManager, roleManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error has occured during migration!");
}

app.Run();