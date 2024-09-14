using System.ComponentModel.DataAnnotations;
using SQLitePCL;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required] // API Controller will do the validation on this DTO when a request is received.
        public string UserName { get; set; } = string.Empty;
        [Required] public string? Gender { get; set; }
        [Required] public string? KnownAs { get; set; }
        [Required] public string? DateOfBirth { get; set; }
        [Required] public string? City { get; set; }
        [Required] public string? Country { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}