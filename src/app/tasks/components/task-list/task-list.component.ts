import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Task } from '../../models/task.model';
import * as TaskActions from '../../store/task.actions';
import * as TaskSelectors from '../../store/task.selectors';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  template: `
    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Your Tasks</h2>
      
      <div *ngIf="(loading$ | async)" class="flex justify-center my-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      
      <div *ngIf="(tasks$ | async)?.length === 0 && !(loading$ | async)" class="text-center py-6 bg-gray-50 rounded-lg">
        <p class="text-gray-500">No tasks yet. Create one to get started!</p>
      </div>
      
      <div class="space-y-3" *ngIf="(tasks$ | async)?.length">
        <app-task-item
          *ngFor="let task of (tasks$ | async)"
          [task]="task"
          (toggleComplete)="onToggleStatus($event)"
          (delete)="onDeleteTask($event)"
        ></app-task-item>
      </div>
    </div>
  `,
  styles: []
})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]>;
  loading$: Observable<boolean>;
  
  constructor(private store: Store) {
    this.tasks$ = this.store.select(TaskSelectors.selectAllTasks);
    this.loading$ = this.store.select(TaskSelectors.selectTasksLoading);
  }
  
  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }
  
  onToggleStatus(id: string): void {
    this.store.dispatch(TaskActions.toggleTaskStatus({ id }));
  }
  
  onDeleteTask(id: string): void {
    this.store.dispatch(TaskActions.deleteTask({ id }));
  }
}
