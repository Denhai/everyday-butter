import { Component, OnInit } from '@angular/core';
import { AngularFire } from 'angularfire2';

import { ROUTER_DIRECTIVES } from '@angular/router-deprecated';

@Component({
    selector: 'nav',
    template: require('./nav.component.html'),
    directives: [...ROUTER_DIRECTIVES],
    // styles: [require('./login.component.scss')],
})
export class NavComponent implements OnInit {

    constructor(public af: AngularFire) {
    }

    ngOnInit() {
    }

    logout() {
        this.af.auth.logout();
    }
}
