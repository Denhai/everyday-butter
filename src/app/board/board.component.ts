import { Component, OnInit } from '@angular/core';
import { RouteParams } from '@angular/router-deprecated';
import {AngularFire} from 'angularfire2';

@Component({
  selector: 'my-board',
  template: require('./board.component.html')
})
export class BoardComponent implements OnInit {
  board = {};
  constructor(private routeParams: RouteParams, private af: AngularFire) {
    af.auth.subscribe(user => {
      if (!user) {
        return;
      }
      af.object('users/' + user.uid + '/boards/' + routeParams.get('key')).subscribe(board => {
        this.board = board;
      console.log(this.board);
      });
    });
  }

  ngOnInit() {
  }
}
