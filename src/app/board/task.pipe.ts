import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inList'
})
export class TaskInListPipe implements PipeTransform {
  transform(tasks: any[], parentListKey: string) {
    return tasks.filter(task => {
      return task.list === parentListKey;
    });
  }
}
