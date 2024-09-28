using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    DataContext _dbContext;
    ITokenService _tokenService;
    IMapper _mapper;
    public AccountController(DataContext dbContext, ITokenService tokenService, IMapper mapper)
    {
        _dbContext = dbContext;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    [HttpPost("register")] // POST: api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto) // API controller attribute converts the incoming json object into Register DTO, provided
    // the properties of DTO (UserName, Password) are same as incoming JSON's attributes, case insensitive.
    {
        if (await UserExists(registerDto.UserName)) return BadRequest("User already exists");

        // return Ok();
        // Calculate password hash and password salt.
        using var hmac = new HMACSHA512();
        var user = this._mapper.Map<AppUser>(registerDto);
        user.UserName = registerDto.UserName.ToLower();
        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
        user.PasswordSalt = hmac.Key;
        // var newUSer = new AppUser
        // {
        //     UserName = registerDto.UserName.ToLower(),
        //     PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
        //     PasswordSalt = hmac.Key
        // };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();
        return new UserDto
        {
            UserName = user.UserName,
            Token = _tokenService.CreateToken(user),
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var User = await _dbContext.Users
        .Include(p => p.Photos)
        .FirstOrDefaultAsync(x => x.UserName == loginDto.UserName);
        if (User == null)
        return Unauthorized("Invalid username");
        
        // var hmac = new HMACSHA512(User.PasswordSalt);
        // var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
        // for (int i = 0; i < computedHash.Length; i++)
        // {
        //     if (computedHash[i] != User.PasswordHash[i])
        //         return Unauthorized("Invalid Password");
        // }

        return new UserDto
        {
            UserName = User.UserName,
            Token = _tokenService.CreateToken(User),
            KnownAs = User.KnownAs,
            PhotoUrl = User.Photos.FirstOrDefault(x => x.IsMain)?.Url,
            Gender = User.Gender
        };
    }

    private async Task<bool> UserExists(string username)
    {
        return await _dbContext.Users.AnyAsync(x => x.UserName == username.ToLower());
    }
}
