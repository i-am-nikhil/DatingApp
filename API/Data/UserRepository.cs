using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API;

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

    public async Task<IEnumerable<MemberDto>> GetMembersAsync()
    {
        return await context.Users
            .ProjectTo<MemberDto>(mapper.ConfigurationProvider) // We are projecting to a single memberDTO here, hence IEnumerable not required.
            .ToListAsync();
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        // return await context.Users.FindAsync(id);
        return await context.Users.Include(x => x.Photos).SingleOrDefaultAsync(x => x.Id == id);
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
