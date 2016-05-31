import { Component } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import { ApiService } from './shared';
import { HomeComponent } from './home';
import { AboutComponent } from './about';
import { LoginComponent } from './login';
import { NavComponent } from './nav';
import { BoardComponent } from './board';


import '../style/app.scss';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'my-app',
  providers: [ApiService],
  directives: [...ROUTER_DIRECTIVES, NavComponent],
  template: require('./app.component.html'),
  styles: [require('./app.component.scss')],
})
@RouteConfig([
  {path: '/', component: HomeComponent, name: 'Home'},
  {path: '/About', component: AboutComponent, name: 'About'},
  {path: '/Login', component: LoginComponent, name: 'Login'},
  {path: '/board/:key', component: BoardComponent, name: 'Board'},
])
export class AppComponent {
  constructor(private api: ApiService) {
  }
}
