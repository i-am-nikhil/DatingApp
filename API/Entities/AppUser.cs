using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class AppUser
{
    public int Id { get; set; }

    public required string UserName { get; set; } // camel casing because it makes life easier when we use dotnet identities

    public required byte[] PasswordHash {get; set;}

    public required byte[] PasswordSalt { get; set; }
}
