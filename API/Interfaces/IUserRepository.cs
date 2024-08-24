using API.DTOs;
using API.Entities;

namespace API.Interfaces;

public interface IUserRepository
{
    public Task<bool> SaveUsersAsync();
    public Task<IEnumerable<AppUser>> GetAllUsersAsync();
    public Task<AppUser> GetUserByIdAsync(int id);
    public Task<AppUser> GetUserByNameAsync(string name);
    public void Update(AppUser user);
    public Task<MemberDto?> GetMemberByNameAsync(string name);
    public Task<IEnumerable<MemberDto>> GetMembersAsync();
    public Task<MemberDto?> GetMemberByIdAsync(int id);

}
