using System.Security.AccessControl;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
{
    private readonly IMapper _mapper = mapper;

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var otherUser = httpContext?.Request.Query["User"];
        if (Context.User == null || string.IsNullOrWhiteSpace(otherUser))
            throw new Exception("Cannot join group");
        // Add group to SignalR
        var groupName = GetGroupName(Context.User.GetUsername(), otherUser);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        // Add this group to database
        var group = await AddToGroup(groupName);

        await Clients.Group(groupName).SendAsync("UpdatedGroup", group);

        // Return message thread
        var messages = await messageRepository.GetMessageThread(Context.User.GetUsername(), otherUser!);
        await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
    }

    /// <summary>
    /// Nothing to do here because when a user disconnects from a group, SignalR automatically disconnets them.
    /// </summary>
    /// <param name="exception"></param>
    /// <returns></returns>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var group = await RemoveFromMessageGroup();
        await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var username = Context.User?.GetUsername() ?? throw new Exception("could not get user");
        if(username.Equals(createMessageDto.RecipientUsername, StringComparison.CurrentCultureIgnoreCase))
        {
            throw new HubException("You cannot message yourself");
        }

        var sender = await userRepository.GetUserByNameAsync(username);
        var recipient = await userRepository.GetUserByNameAsync(createMessageDto.RecipientUsername);

        if (recipient == null || sender == null || sender.UserName == null || recipient.UserName == null)
        {
            throw new HubException("Cannot send message this time");
        }

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUsername = sender.UserName,
            ReceiverUsername = recipient.UserName,
            Content = createMessageDto.Content
        };

        var groupName = GetGroupName(sender.UserName, recipient.UserName);
        var group = await messageRepository.GetMessageGroup(groupName);
        if (group != null && group.Connections.Any(x => x.Username == recipient.UserName))
        {
            message.DateRead = DateTime.UtcNow;
        }
        else
        {
            //The user is online but not connected to the hub.
            var connections = await PresenceTracker.GetConnectionsForUser(recipient.UserName);
            if (connections != null && connections?.Count != null)
            {
                await presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived", new {username = sender.UserName, knownAs = sender.KnownAs});
                // presenceHub is where an online user is connected. The intention of this else block is to notify the users that are online but not connected
                // to messageHub (not in the message tab). Such users are connected to the presence hub. Hence we have to use the clients the presence hub here,
                // not message hub.
            }
        }

        messageRepository.AddMessage(message);
        if (await messageRepository.SaveAllAsync())
        {
            await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
        }
    }

    private async Task<Group> AddToGroup(string groupName)
    {
        var username = Context.User?.GetUsername() ?? throw new Exception("Can't get username");
        var group = await messageRepository.GetMessageGroup(groupName);
        var Connection = new Connection{ ConnectionId = Context.ConnectionId, Username = username};
        if (group == null)
        {
            group = new Group{Name = groupName};
            messageRepository.AddGroup(group);
        }

        group.Connections.Add(Connection);
        if(await messageRepository.SaveAllAsync()) return group;
        throw new HubException("Failed to join group");
    }

    private async Task<Group> RemoveFromMessageGroup()
    {
        var group = await messageRepository.GetGroupForConnection(Context.ConnectionId);
        var connection = group?.Connections.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
        if (connection != null && group != null)
        {
            messageRepository.RemoveConnection(connection);
            if (await messageRepository.SaveAllAsync()) return group;
        }
            throw new Exception("Failed to remove from group");
    }

    /// <summary>
    /// Ensures that group name for a chatbox is always in alphabetical order of usernames. (Always Lisa-Todd, never Todd-Lisa)
    /// </summary>
    private string GetGroupName(string caller, string? other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }
}
