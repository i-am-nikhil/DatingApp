using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace API.Data;

public class UserRepository(DataContext context, IMapper mapper) : IUserRepository
{
    public async Task<IEnumerable<AppUser>> GetAllUsersAsync()
    {
        return await context.Users.Include(x => x.Photos).ToListAsync();
    }

    public Task<MemberDto?> GetMemberByIdAsync(int id)
    {
        return context.Users
        .Where(x => x.Id == id)
        .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
        // .Include(x => x.Photos)
        .SingleOrDefaultAsync();
    }

    public Task<MemberDto?> GetMemberByNameAsync(string name)
    {
        return context.Users
        .Where(x => x.UserName == name)
        .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
        // .Include(x => x.Photos)
        .SingleOrDefaultAsync();

    }

    public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
    {
        var query = context.Users.AsQueryable();
        query = query.Where(x => x.UserName != userParams.CurrentUsername);
            
        if (userParams.Gender != null)
        {
            query = query.Where(x => x.Gender == userParams.Gender);
        }

        var minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-userParams.MaxAge-1));
        var maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-userParams.MinAge));

        query = query.Where(x => x.DateOfBirth >= minDob && x.DateOfBirth <= maxDob);

        query = userParams.OrderBy switch
        {
            "created" => query.OrderByDescending(x => x.Created),
            _ => query.OrderByDescending(x => x.LastActive)
        };

        return await PagedList<MemberDto>.CreateAsync(query.ProjectTo<MemberDto>(mapper.ConfigurationProvider),
            userParams.PageNumber, userParams.PageSize);
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        return await context.Users.FindAsync(id);
        // return await context.Users.Include(x => x.Photos).SingleOrDefaultAsync(x => x.Id == id);
    }

    public async Task<AppUser> GetUserByNameAsync(string name)
    {
        return await context.Users.Include(x => x.Photos).SingleOrDefaultAsync(x => x.UserName == name);
    }

    public async Task<bool> SaveUsersAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void Update(AppUser user)
    {
        context.Entry(user).State = EntityState.Modified;
    }
}
