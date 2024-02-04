using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext : DbContext
{
    public DataContext(DbContextOptions options) : base(options)
    {
        
    }

    public DbSet<AppUser> Users { get; set; } // Entity Framework makes a DB with the same name "Users".
    // AppUSers has two members: Id and UserName, these will turn into column names.
}
