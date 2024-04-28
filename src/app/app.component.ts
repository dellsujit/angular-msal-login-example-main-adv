
import { AuthenticationResult, EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'My Microsoft Login- Example';
  isIframe = false;
  private readonly _destroying$ = new Subject<void>();
  loginDisplay: boolean;

  constructor(private authService: MsalService, private broadcastService: MsalBroadcastService,) {

  }
  ngOnInit(): void {
    console.log(this.broadcastService.inProgress$);
    this.isIframe = window !== window.parent && !window.opener;
    this.broadcastService.inProgress$
    .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None)
    ,takeUntil(this._destroying$))
    .subscribe(async () => {
      if (!this.authenticated) {
        await this.login();
      }
    });
    this.broadcastService.msalSubject$
         .pipe(filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.SSO_SILENT_SUCCESS))
         .subscribe((result: EventMessage) => {
           const payload = result.payload as AuthenticationResult;
           this.authService.instance.setActiveAccount(payload.account);
         });

    // this.authService.instance.handleRedirectPromise().then( res => {
    //   if (res != null && res.account != null) 
    //   {
    //     this.authService.instance.setActiveAccount(res.account)
    //   }
    // })


  }
  get authenticated(): boolean {
    return this.authService.instance.getActiveAccount() ? true : false;
 }
  isLoggedIn(): boolean {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    return this.authService.instance.getActiveAccount() ? true : false;
  }

  async login() 
  {
    alert("inside login")
     await this.authService.instance.loginRedirect({
        scopes: ['user.read', 'openid', 'profile'],
        redirectUri:'https://localhost:4200/'
     });
  };

  logout() {
    this.authService.logout()
  }
  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
