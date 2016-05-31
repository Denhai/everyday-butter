import { Directive, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';
import { AngularFire } from 'angularfire2';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[authenticated]'
})
export class AuthenticatedDirective implements OnDestroy {
  private sub: Subscription;

  constructor(private af: AngularFire, private router: Router, private location: Location) {
    // http://stackoverflow.com/questions/34331478/angular2-redirect-to-login-page
    if (!af.auth.getAuth()) {
      this.location.replaceState('/');
      this.router.navigate(['Login']);
    }

    this.sub = af.auth.subscribe(auth => {
      if (!auth) {
        this.location.replaceState('/');
        this.router.navigate(['Login']);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub != null) {
      this.sub.unsubscribe();
    }
  }
}
