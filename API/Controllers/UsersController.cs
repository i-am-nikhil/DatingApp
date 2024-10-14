using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

 // .../api/users
 [Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery]UserParams userParams)
    {
        userParams.CurrentUsername = User.GetUsername();
        var users = await userRepository.GetMembersAsync(userParams);
        Response.AddPaginationHeader(users);

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
        // var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        // if (username == null) return BadRequest("No username found in token");

        var user = await userRepository.GetUserByNameAsync(User.GetUsername());
        if (user == null) return BadRequest("Could not find user");
        mapper.Map(memberUpdateDto, user); // We have retrieved user object from the database and entity framework tracks it.
        // When we update it with automapper, Entity Framework makes this changes to this object and when we call Save method next, it saves everything to the datbase.
        // If there is no update in the user, EF will not update the DB.
        if(await userRepository.SaveUsersAsync()) return NoContent();

        return BadRequest("Failed to update the user.");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>>AddPhoto(IFormFile file)
    {
        var user = await userRepository.GetUserByNameAsync(User.GetUsername());

        if (user == null) return BadRequest("Cannot update user");
        var result = await photoService.AddPhotoAsync(file);
        if (result.Error != null) return BadRequest(result.Error.Message);

        var photo = new Photo
        {
            Url = result.SecureUrl.AbsoluteUri,
            PublicId = result.PublicId
        };

        if (user.Photos.Count == 0) photo.IsMain = true;

        user.Photos.Add(photo);
        if (await userRepository.SaveUsersAsync())
            return CreatedAtAction(nameof(GetUserByName), new {username = user.UserName}, mapper.Map<PhotoDto>(photo)); // GetUserByName's route value is {username}, 
            //so in the second parameter we are providing the value for that username
        return BadRequest("Problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId:int}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var user = await userRepository.GetUserByNameAsync(User.GetUsername());
        if (user == null) return BadRequest("Couldn't find user.");
        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
        if (photo == null || photo.IsMain) return BadRequest("Cannot use this as main photo");
        var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
        if (currentMain != null) currentMain.IsMain = false;
        photo.IsMain = true;

        if (await userRepository.SaveUsersAsync()) return NoContent();
        return BadRequest("Problem setting main photo");
    }

    [HttpDelete("delete-photo/{photoId:int}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var user = await userRepository.GetUserByNameAsync(User.GetUsername());
        if (user == null) return BadRequest("User not found");
        var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);
        if(photo == null || photo.IsMain) return BadRequest("this photo cannot be deleted");

        if (photo.PublicId == null) return BadRequest("");
        var result = await photoService.DeletePhotoAsync(photo.PublicId);
        if (result.Error != null) return BadRequest(result.Error.Message);
        user.Photos.Remove(photo);
        if (await userRepository.SaveUsersAsync()) return Ok();
        return BadRequest("Problem deleting photo");
    }
}
