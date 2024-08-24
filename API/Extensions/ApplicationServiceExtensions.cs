using API.Data;
using API.Interfaces;
using API.Services;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<DataContext>(opt =>
{
    opt.UseSqlite(config.GetConnectionString("DefaultConnection")); // TODO: Undertand this.
    // 1. GetConnectionString reads the "ConnectionString" parameter defined in appsettings.Development.json
});

        services.AddCors();
        services.AddScoped<ITokenService, TokenService>(); // Scoped Service's lifecycle is maintained per HTTP request.
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        return services;
    }
}
