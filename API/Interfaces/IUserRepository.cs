using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUserRepository
{
    public Task<bool> SaveUsersAsync();
    public Task<IEnumerable<AppUser>> GetAllUsersAsync();
    public Task<AppUser> GetUserByIdAsync(int id);
    public Task<AppUser> GetUserByNameAsync(string name);
    public void Update(AppUser user);
    public Task<MemberDto?> GetMemberByNameAsync(string name);
    public Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams);
    public Task<MemberDto?> GetMemberByIdAsync(int id);

}
