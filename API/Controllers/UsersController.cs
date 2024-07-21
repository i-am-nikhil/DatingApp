using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

 // .../api/users
 [Authorize]
public class UsersController(DataContext context) : BaseApiController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
    {
        byte[] data = new byte[3];
        var newUSer = new AppUser
        {
            UserName = "Bob",
            PasswordHash = data,
            PasswordSalt = data
        };

        var newUSer1 = new AppUser
        {
            UserName = "Dave",
            PasswordHash = data,
            PasswordSalt = data
        };
        var users = new List<AppUser>
        {
            newUSer1,
            newUSer
        };
        // var users = await context.Users.ToListAsync();
        return users;
    }

    [HttpGet("{id:int}")] // .../api/users/2
    public async Task<ActionResult<AppUser>> GetUser(int id)
    {
        var user = await context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        
        return user;
    }
}
