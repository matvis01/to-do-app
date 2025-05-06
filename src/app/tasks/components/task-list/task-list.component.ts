import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";

import { Task } from "../../models/task.model";
import * as TaskActions from "../../store/task.actions";
import * as TaskSelectors from "../../store/task.selectors";
import { TaskItemComponent } from "../task-item/task-item.component";

@Component({
  selector: "app-task-list",
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  template: `
    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Your Tasks</h2>

      <div *ngIf="loading$ | async" class="flex justify-center my-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
      </div>

      <div
        *ngIf="(filteredTasks$ | async)?.length === 0 && !(loading$ | async)"
        class="text-center py-6 bg-gray-50 rounded-lg"
      >
        <p class="text-gray-500">
          No tasks found. {{ getEmptyStateMessage(currentFilter$ | async) }}
        </p>
      </div>

      <div class="space-y-3" *ngIf="(filteredTasks$ | async)?.length">
        <app-task-item
          *ngFor="let task of filteredTasks$ | async"
          [task]="task"
          (toggleComplete)="onToggleStatus($event)"
          (delete)="onDeleteTask($event)"
          (edit)="onEditTask($event)"
        ></app-task-item>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskListComponent implements OnInit {
  filteredTasks$: Observable<Task[]>;
  loading$: Observable<boolean>;
  currentFilter$: Observable<string>;
  @Output() editTask = new EventEmitter<Task>();

  constructor(private store: Store) {
    this.filteredTasks$ = this.store.select(TaskSelectors.selectFilteredTasks);
    this.loading$ = this.store.select(TaskSelectors.selectTasksLoading);
    this.currentFilter$ = this.store.select(TaskSelectors.selectCurrentFilter);
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

  onEditTask(task: Task): void {
    this.editTask.emit(task);
  }

  getEmptyStateMessage(filter: string | null): string {
    switch (filter) {
      case "active":
        return "All tasks are completed!";
      case "completed":
        return "No completed tasks yet.";
      case "all":
      default:
        return "Create one to get started!";
    }
  }
}
