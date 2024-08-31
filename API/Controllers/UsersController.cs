using System.Security.Claims;
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
public class UsersController(IUserRepository userRepository, IMapper mapper) : BaseApiController
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

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (username == null) return BadRequest("No username found in token");

        var user = await userRepository.GetUserByNameAsync(username);
        if (user == null) return BadRequest("Could not find user");
        mapper.Map(memberUpdateDto, user); // We have retrienved user object from the databse and entity framework tracks it.
        // When we update it with automapper, Entity Framework makes this changes to this object and when we call Save method next, it saves everything to the datbase.
        // If there is no update in the user, EF will not update the DB.
        if(await userRepository.SaveUsersAsync()) return NoContent();

        return BadRequest("Failed to update the user.");
    }
}
