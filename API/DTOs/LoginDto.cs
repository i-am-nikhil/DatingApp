using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class LoginDto
    {
        [Required] // API Controller will do the validation on this DTO when a request is received.
        public string UserName { get; set; } = "";

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}