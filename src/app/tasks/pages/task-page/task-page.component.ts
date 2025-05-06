import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TaskListComponent } from "../../components/task-list/task-list.component";
import { TaskFormComponent } from "../../components/task-form/task-form.component";
import { TaskFilterComponent } from "../../components/task-filter/task-filter.component";
import { DateFilterComponent } from "../../components/date-filter/date-filter.component";
import { Store } from "@ngrx/store";
import { Observable, map } from "rxjs";
import * as TaskSelectors from "../../store/task.selectors";
import * as TaskActions from "../../store/task.actions";
import { Task } from "../../models/task.model";

@Component({
  selector: "app-task-page",
  standalone: true,
  imports: [
    CommonModule,
    TaskListComponent,
    TaskFormComponent,
    TaskFilterComponent,
    DateFilterComponent,
  ],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-800">To-Do List App</h1>
        <p class="text-gray-600 mt-2">Stay organized and productive</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1">
          <app-task-form
            [taskToEdit]="taskToEdit"
            (cancelEdit)="onCancelEdit()"
          ></app-task-form>

          <ng-container
            *ngIf="{
              total: totalTasks$ | async,
              completed: completedTasks$ | async,
              active: activeTasks$ | async
            } as stats"
          >
            <div class="mt-6 bg-white p-4 rounded-lg border shadow-sm">
              <h2 class="text-xl font-semibold mb-2">Task Statistics</h2>
              <div class="space-y-2">
                <p class="flex justify-between">
                  <span>Total Tasks:</span>
                  <span class="font-semibold">{{ stats.total || 0 }}</span>
                </p>
                <p class="flex justify-between">
                  <span>Completed:</span>
                  <span class="font-semibold">{{
                    stats.completed?.length || 0
                  }}</span>
                </p>
                <p class="flex justify-between">
                  <span>Active:</span>
                  <span class="font-semibold">{{
                    stats.active?.length || 0
                  }}</span>
                </p>
              </div>
            </div>
          </ng-container>
        </div>

        <div class="md:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-task-filter></app-task-filter>
            <app-date-filter></app-date-filter>
          </div>
          <app-task-list (editTask)="onEditTask($event)"></app-task-list>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskPageComponent implements OnInit {
  completedTasks$: Observable<any[]>;
  activeTasks$: Observable<any[]>;
  totalTasks$: Observable<number>;
  taskToEdit: Task | null = null;

  constructor(private store: Store) {
    this.completedTasks$ = this.store.select(
      TaskSelectors.selectCompletedTasks
    );
    this.activeTasks$ = this.store.select(TaskSelectors.selectActiveTasks);
    this.totalTasks$ = this.store
      .select(TaskSelectors.selectAllTasks)
      .pipe(map((tasks) => tasks.length));
  }

  ngOnInit(): void {
    // Ensure tasks are loaded when component initializes
    this.store.dispatch(TaskActions.loadTasks());
  }

  onEditTask(task: Task): void {
    this.taskToEdit = task;
  }

  onCancelEdit(): void {
    this.taskToEdit = null;
  }
}
