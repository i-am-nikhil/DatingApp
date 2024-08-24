using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

 // .../api/users
 [Authorize]
public class UsersController(IUserRepository userRepository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
        var users = await userRepository.GetMembersAsync();

        return Ok(users);
    }

    [HttpGet("{id:int}")] // .../api/users/2
    public async Task<ActionResult<MemberDto>> GetUser(int id)
    {
        var user = await userRepository.GetMemberByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        
        return user;
    }
    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUserByName(string userName)
    {
        var user = await userRepository.GetMemberByNameAsync(userName);
        if (user == null)
        {
            return NotFound();
        }

        return user;
    }
}
