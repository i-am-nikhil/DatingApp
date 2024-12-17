using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext : IdentityDbContext<AppUser, AppRole, int, IdentityUserClaim<int>, 
    AppUserRole, IdentityUserLogin<int>, IdentityRoleClaim<int>, IdentityUserToken<int>>
{
    public DataContext(DbContextOptions options) : base(options)
    {
        
    }

    public DbSet<UserLike> Likes {get; set; } // Entity Framework makes a DB with the same name "Users".
    // AppUSers has two members: Id and UserName, these will turn into column names.
    public DbSet<Message> Messages { get; set; }
    protected override void OnModelCreating(ModelBuilder builder) // Since Likes is a table we are creating, we need to configure this for EF. This method overrides EF conventions. 
    { // When we create a migration, EF takes a look at this configuration.
        base.OnModelCreating(builder);
        builder.Entity<AppUser>()
        .HasMany(ur => ur.UserRoles)
        .WithOne(u => u.User)
        .HasForeignKey(u => u.UserId);

        builder.Entity<AppRole>()
         .HasMany(ur => ur.UserRoles)
         .WithOne(u => u.Role)
         .HasForeignKey(u => u.RoleId);

        builder.Entity<UserLike>()
            .HasKey(k => new{k.SourceUserId, k.TargetUserId});
        builder.Entity<UserLike>()
            .HasOne(s => s.SourceUser)
            .WithMany(l => l.LikedUsers)
            .HasForeignKey(s => s.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<UserLike>()
            .HasOne(s => s.TargetUser) // s is of type UserLike
            .WithMany(l => l.LikedByUsers) // l is of type AppUser
            .HasForeignKey(s => s.TargetUserId)
            .OnDelete(DeleteBehavior.Cascade); // In SQL server this line may throw error when there are 2 DeleteBehavior.Cascade and we may have to change it to NoAction.

            builder.Entity<Message>()
                .HasOne(s => s.Recipient)
                .WithMany(l => l.MessagesReceived)
                .OnDelete(DeleteBehavior.Restrict);
            builder.Entity<Message>()
                .HasOne(s => s.Sender)
                .WithMany(l => l.MessagesSent)
                .OnDelete(DeleteBehavior.Restrict);
    }
}
