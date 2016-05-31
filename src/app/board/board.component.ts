import { Component } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { RouteParams } from '@angular/router-deprecated';
import { TaskInListPipe } from './task.pipe';
import { AuthenticatedDirective } from '../authenticated.directive';

@Component({
  selector: 'my-board',
  template: require('./board.component.html'),
  pipes: [TaskInListPipe],
  directives: [AuthenticatedDirective]
})
export class BoardComponent {
  board;
  lists;
  tasks;

  constructor(private routeParams: RouteParams, private af: AngularFire) {
    af.auth.asObservable().filter(user => user !== null).subscribe(user => { // Skip null values
      let boardURL = 'users/' + user.uid + '/boards/' + routeParams.get('key');
      this.board = af.object(boardURL);
      this.lists = af.list(boardURL + '/lists');
      this.tasks = af.list(boardURL + '/tasks');
    });
  }

  addList(input) {
    this.lists.push({title: input.value});
    input.value = '';
  }

  addTask(listKey, input) {
    this.tasks.push({list: listKey, text: input.value});
    input.value = '';
  }
}

