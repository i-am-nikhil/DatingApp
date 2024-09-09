import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Member } from 'src/app/_models/member';
import { Photo } from 'src/app/_models/photo';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  private accountService = inject(AccountService);
  @Input() member : Member | undefined;
  @Output() memberChanged = new EventEmitter();
  uploader?: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  memberService: MembersService = inject(MembersService);

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any){
    this.hasBaseDropZoneOver = e;
  }

  deletePhoto(photo: Photo){
    this.memberService.deletePhoto(photo).subscribe({
      next: _ =>{
        const updatedMember = {...this.member};
        updatedMember.photos = updatedMember.photos?.filter(p => p.id !== photoId);
        this.memberChanged.emit(updatedMember); // This is done so that parent component (member-edit is aware of the changes made in this photos and updates its view accordingly.)
      }
    })
  }

  setMainPhoto(photo: Photo){
    this.memberService.setMainPhoto(photo).subscribe({
      next: _ => {
        const user = this.accountService.currentUser();
        if (user){
          user.photoUrl = photo.url;
          this.accountService.setCurrentUser(user) // Since the user is already logged in when they are updating the main photo, this should not be required.
          // Maybe this is updating the signal and  that goes to nav bar, which refreshes the main photo. that is the reason for this update.
        }
        const updatedMember = {...this.member};
        updatedMember.photoUrl = photo.url;
        updatedMember.photos?.forEach(p => {
          if (p.isMain) p.isMain = false;
          if (p.id === photo.id) p.isMain = true;
        });

        this.memberChanged.emit(updatedMember);
      }
    })
  }

  initializeUploader(){
    this.uploader = new FileUploader({
      url: this.baseUrl +  'users/add-photo',
      authToken: 'Bearer ' + this.accountService.currentUser()?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      autoUpload: false,
      removeAfterUpload: true,
      maxFileSize: 10*1024*1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false; // because we're sending our authentication in headers rather than cookies.
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const photo = JSON.parse(response);
      const updatedMember = {...this.member}
      updatedMember.photos?.push(photo);
      this.memberChanged.emit(updatedMember); 
    }
  }
}
