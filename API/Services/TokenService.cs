using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using API.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key; // Same key encrypts and decrypts the token key.

        public TokenService(IConfiguration configuration)
        {
            var tokenKey = configuration["TokenKey"] ?? throw new Exception("Cannnot access token key from configuration.");
            if (tokenKey.Length < 64) throw new Exception("Your token key is too short.");
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
        }

        public string CreateToken(AppUser user)
        {
            var claims = new List<Claim>
            {
                // new Claim(ClaimTypes.NameIdentifier, user.UserName)
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}