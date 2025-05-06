import { Component, Output, EventEmitter } from "@angular/core";
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
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Your Tasks
        </h2>
        <div
          *ngIf="dateFilter$ | async as dateFilter"
          class="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {{ dateFilter | date : "mediumDate" }}
        </div>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="loading$ | async" class="flex justify-center my-6">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="(filteredTasks$ | async)?.length === 0 && !(loading$ | async)"
        class="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 mx-auto text-gray-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p class="text-gray-500 mb-1">No tasks found</p>
        <p class="text-gray-400 text-sm">
          {{ getEmptyStateMessage(currentFilter$ | async) }}
        </p>
      </div>

      <!-- Task list -->
      <div class="space-y-0" *ngIf="(filteredTasks$ | async)?.length">
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
export class TaskListComponent {
  filteredTasks$: Observable<Task[]>;
  loading$: Observable<boolean>;
  currentFilter$: Observable<string>;
  dateFilter$: Observable<Date | null>;
  @Output() editTask = new EventEmitter<Task>();

  constructor(private store: Store) {
    this.filteredTasks$ = this.store.select(TaskSelectors.selectFilteredTasks);
    this.loading$ = this.store.select(TaskSelectors.selectTasksLoading);
    this.currentFilter$ = this.store.select(TaskSelectors.selectCurrentFilter);
    this.dateFilter$ = this.store.select(TaskSelectors.selectDateFilter);
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
        return "Create a new task to get started!";
    }
  }
}
