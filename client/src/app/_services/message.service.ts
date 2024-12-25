import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { Message } from '../_models/message';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { User } from '../_models/user';
import { group } from '@angular/animations';
import { Group } from '../_models/group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubsUrl;
  hubConnection?: HubConnection;
  private http = inject(HttpClient);
  paginatedResult = signal<PaginatedResult<Message[]> | null>(null);
  messageThread = signal<Message[]>([]);
  createHubConnection(user: User, otherUsername: string){
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: ()=> user.token
      })
      .withAutomaticReconnect()
      .build();
    
      this.hubConnection.start().catch(error => console.log(error));
      this.hubConnection.on('ReceiveMessageThread', messages => {
        this.messageThread.set(messages);
      })
      this.hubConnection.on("NewMessage", message => {
        this.messageThread.update(messages => [...messages, message])
      })
      this.hubConnection.on("UpdatedGroup", (group : Group) => {
        if (group.connections.some(x => x.username === otherUsername)){
          this.messageThread.update(messages => {
            messages.forEach(message => {
              if (!message.dateRead){
                message.dateRead = new Date(Date.now());
              }
            })
            return messages;
          })
        }
      })
  }

  stopHubConnection(){
    if (this.hubConnection?.state === HubConnectionState.Connected){
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string){
    let params = setPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return this.http.get<Message[]>(this.baseUrl + 'messages', {observe: 'response', params})
      .subscribe({
        next: response => setPaginatedResponse(response, this.paginatedResult)
      })
  }

  getMessageThread(username: string | undefined){
    // if (username === undefined) return;
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessages(username: string | undefined,content: string){ // async is written here so this method always returns a promise. Otherwise it can return undefined as well.
    // return this.http.post<Message>(this.baseUrl + 'messages', {RecipientUsername: username, content});
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: username, content}) // args are what SendMessage is expecting, which is CreateMessageDto,
    //which has recipientusername and content
  }

  deleteMessage(id: number){
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
