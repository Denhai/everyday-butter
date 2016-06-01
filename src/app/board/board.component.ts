import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { RouteParams } from '@angular/router-deprecated';
import { TaskInListPipe } from './task.pipe';
import { AuthenticatedDirective } from '../authenticated.directive';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { Observable } from 'rxjs/Rx';
import { List, Task } from './interfaces';

@Component({
  selector: 'my-board',
  template: require('./board.component.html'),
  styles: [require('./board.component.scss')],
  pipes: [TaskInListPipe],
  directives: [Dragula, AuthenticatedDirective],
  viewProviders: [DragulaService]
})
export class BoardComponent {
  board: FirebaseObjectObservable<any>;
  lists: FirebaseListObservable<List[]>;
  tasks: FirebaseListObservable<Task[]>;
  listObservable: FirebaseListObservable<List[]>;
  taskObservable: FirebaseListObservable<Task[]>;
  boardURL: string;

  constructor(private routeParams: RouteParams, private af: AngularFire, private dragulaService: DragulaService) {
    af.auth.asObservable().filter(user => user !== null).subscribe(user => { // Skip null values
      this.boardURL = 'users/' + user.uid + '/boards/' + routeParams.get('key');
      this.board = af.object(this.boardURL);
      this.lists = af.list(this.boardURL + '/lists', { query: { orderByChild: 'priority' } });
      this.tasks = af.list(this.boardURL + '/tasks', { query: { orderByChild: 'priority' } });

      this.listObservable = af.list(this.boardURL + '/lists');
      this.taskObservable = af.list(this.boardURL + '/tasks');
    });

    // The outer list can only be dragged by a handle. To prevent overlapping drag boxes.
    dragulaService.setOptions('listBag', {
      moves: function (el, container, handle) {
        return handle.className === 'handle';
      }
    });

    dragulaService.drop.subscribe(([bag, element, target, source, next]) => {
      // Look at the adjacent tasks in the list and pick a priority in the middle
      let prev = element.previousElementSibling;

      if (bag === 'taskBag') {
        let observables: Observable<Task>[] = [Observable.of(undefined), Observable.of(undefined), Observable.of(undefined)];
        // Get the keys from the DOM. Stored in data-key attributes.
        if (prev != null && prev.className === 'task') observables[0] = (af.object(this.boardURL + '/tasks/' + prev.dataset.key));
        if (element != null && element.className === 'task') observables[1] = (af.object(this.boardURL + '/tasks/' + element.dataset.key));
        if (next != null && next.className === 'task') observables[2] = (af.object(this.boardURL + '/tasks/' + next.dataset.key));

        Observable.zip(...observables) // Combine the observables then subscribe asynchronously
          .take(1) // only subscribe once
          .subscribe(([previousTask, movedTask, nextTask]: Task[]) => {
            let lower = -4; // arbitrary
            let upper = 4;  // arbitrary
            if (previousTask && previousTask.priority != null) {
              lower = previousTask.priority;
            } else if (nextTask && nextTask.priority != null) {
              lower = nextTask.priority - 4;
            }
            if (nextTask && nextTask.priority != null) {
              upper = nextTask.priority;
            } else if (previousTask && previousTask.priority != null) {
              upper = previousTask.priority + 4;
            }
            // Update the priority of the moved task in the database
            movedTask.priority = lower + (Math.abs(upper - lower) / 2);
            // Check if it swapped to a different list
            if (target.dataset.key !== source.dataset.key) {
              movedTask.list = target.dataset.key;
            }
            this.taskObservable.update(element.dataset.key, movedTask);
          });
      } else if (bag === 'listBag') {
        // TODO reorder the lists, similar as above
      }
    });
  }

  addList(input) {
    let push = priority => {
      let list: List = { title: input.value, priority };
      this.listObservable.push(list);
      input.value = '';
    };
    // The DOM element of the last list
    let lastList = document.querySelector(`li.list:last-child ul`);
    if (!lastList) {
      push(0);
      return;
    }
    // Get information from the database about it
    this.af.object(this.boardURL + '/lists/' + lastList.attributes['data-key'].value)
      .subscribe((value: List) => {
        // Set the priority of the new list higher than the last list to put it at the end
        push(value.priority + 2);
      });
  }

  addTask(listKey, input) {
    let push = priority => {
      let task: Task = { list: listKey, text: input.value, priority };
      this.taskObservable.push(task);
      input.value = '';
    };
    let lastTask = document.querySelector(`ul[data-key="${listKey}"] li:last-child`);
    if (!lastTask) {
      push(0);
      return;
    }
    this.af.object(this.boardURL + '/tasks/' + lastTask.attributes['data-key'].value)
      // TODO lastTask.dataset.key (can we use this? or is it only available in some browsers?)
      .subscribe((value: Task) => {
        push(value.priority + 2);
      });
  }
}

