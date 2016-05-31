import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { AuthenticatedDirective } from '../authenticated.directive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'board-preview',
  template: `
    <div>
        Board: <a [routerLink]="['Board', {key:board.$key}]">{{board.title}}</a>
        <!--<form (submit)="setPriority(input)">-->
            <!--<input #input type="text" placeholder="priority" [(ngModel)]="board['.priority']">-->
        <!--</form>-->
    </div>
    `,
  directives: [...ROUTER_DIRECTIVES],
})
class BoardPreviewComponent {
  @Input()
  board;
  @Output()
  update: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  setPriority(input) {
    this.board['.priority'] = input.value;
    this.update.emit(this.board);
  }
}


@Component({
  selector: 'my-home',
  template: require('./home.component.html'),
  styles: [require('./home.component.scss')],
  directives: [AuthenticatedDirective, BoardPreviewComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  boards;
  boardsObservable: FirebaseListObservable<any[]>;
  subscription: Subscription;

  constructor(public af: AngularFire) {
    af.auth.subscribe(user => {
      if (!user) {
        return;
      }
      // this.boardsObservable = af.list('users/' + user.uid + '/boards');
      this.boardsObservable = af.list('users/' + user.uid + '/boards', {preserveSnapshot: true});
      this.subscription = this.boardsObservable.subscribe((snapshot: FirebaseDataSnapshot[]) => {
        this.boards = snapshot.map(snap => {
          let val = snap.exportVal();
          val['$key'] = snap.key();
          return val;
        });
      });
    });
  }

  ngOnInit() {
  }

  addBoard(boardInput) {
    this.boardsObservable.push({
      title: boardInput.value
    });
    boardInput.value = '';
  }

  update(board) {
    console.log(board);
    let key = board.$key;
    delete board['$key'];
    this.boardsObservable.update(key, board);
  }

  ngOnDestroy() {
    if (this.subscription !== undefined)
      this.subscription.unsubscribe();
  }
}
