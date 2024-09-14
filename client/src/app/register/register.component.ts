import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  accountService = inject(AccountService);
  registerForm: FormGroup = new FormGroup({});
  private router = inject(Router);
  // @Input() usersFromHomeComponent: any;
  @Output() cancelRegister = new EventEmitter();
  private fb = inject(FormBuilder);
  maxDate = new Date();
  validationErrors: string[] | undefined;
  register() {
    const dob = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    this.registerForm.patchValue({dateOfBirth: dob});
    this.accountService.register(this.registerForm.value).subscribe({  
      next: _ => {
        this.router.navigateByUrl('/members')
      },
      error: error => this.validationErrors = error
    });
  }
  cancel() {
    this.cancelRegister.emit(false);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }
  
  initializeForm(){
    this.registerForm = this.fb.group({
      gender: ['male', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValue('password')]]
    })

    // During validation we validate if confirm password is same as password. Following code ensures that if user updates 'password' after
    // they input 'confirm password' we still validate the confirm paswword against password.
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: _ => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    })
  }  

  matchValue(matchTo: string): ValidatorFn{
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true} // control is the form control. control.parent gets the parent form group. control.parent.get() finds another control in this group.
    }
  }

  private getDateOnly(dob: string | undefined){
    if (!dob) return;
    return new Date(dob).toISOString().slice(0,10);
  }

}
