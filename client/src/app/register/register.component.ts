import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  accountService = inject(AccountService);
  private toaster = inject(ToastrService);
ngOnInit(): void {

}
model: any = {}
  // @Input() usersFromHomeComponent: any;
  @Output() cancelRegister = new EventEmitter();
  register() {
    this.accountService.register(this.model).subscribe({  
      next: response => {
        console.log(response);
        this.cancel(); // cancel is only used here to close the register form.
      },
      error: error => this.toaster.error(error.error)
    });
  }
  cancel() {
    this.cancelRegister.emit(false);
  }
}
