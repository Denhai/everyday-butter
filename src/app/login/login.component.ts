import { Component, OnInit } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Component({
    selector: 'my-login',
    template: require('./login.component.html'),
})
export class LoginComponent implements OnInit {

    constructor(public af: AngularFire) {
    }

    ngOnInit() {
    }

    login() {
        this.af.auth.login();
    }
}
