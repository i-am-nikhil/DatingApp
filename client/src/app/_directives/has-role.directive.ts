import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Directive({
  selector: '[appHasRole]' //*appHasRole
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[] = [];
  viewContainerRef = inject(ViewContainerRef);
  templateRef = inject(TemplateRef);
  accountService = inject(AccountService);
  ngOnInit(): void {
    if (this.accountService.roles()?.some((r: string) => this.appHasRole.includes(r))){
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }else{
      this.viewContainerRef.clear();
    }
  }
}
