import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TaskListComponent } from "../../components/task-list/task-list.component";
import { TaskFormComponent } from "../../components/task-form/task-form.component";
import { TaskFilterComponent } from "../../components/task-filter/task-filter.component";
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
  ],
  template: `
    <div class="flex flex-col min-h-screen">
      <div class="flex-grow bg-gray-50">
        <!-- Header with gradient background -->
        <header
          class="bg-gradient-to-r from-blue-600 to-indigo-700 py-10 mb-8 text-white shadow-md"
        >
          <div class="container mx-auto px-4">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-3xl font-bold mb-2">My Tasks</h1>
              <p class="text-blue-100">
                Stay organized and boost your productivity
              </p>
            </div>
          </div>
        </header>

        <!-- Main content -->
        <div class="container mx-auto px-4 pb-10">
          <div class="max-w-4xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Left sidebar with form and stats -->
              <div class="lg:col-span-1">
                <div class="app-card mb-6">
                  <app-task-form
                    [taskToEdit]="taskToEdit"
                    (cancelEdit)="onCancelEdit()"
                  ></app-task-form>
                </div>

                <ng-container
                  *ngIf="{
                    total: totalTasks$ | async,
                    completed: completedTasks$ | async,
                    active: activeTasks$ | async
                  } as stats"
                >
                  <div class="app-card">
                    <h2
                      class="text-xl font-semibold mb-4 text-gray-800 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mr-2 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path
                          d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
                        />
                      </svg>
                      Task Progress
                    </h2>

                    <!-- Progress bar -->
                    <div class="mb-4">
                      <div
                        class="h-3 w-full bg-gray-100 rounded-full overflow-hidden"
                      >
                        <div
                          class="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                          [style.width.%]="
                            getCompletionPercentage(
                              stats.completed?.length || 0,
                              stats.total || 0
                            )
                          "
                        ></div>
                      </div>
                      <div class="text-xs text-right mt-1 text-gray-500">
                        {{ stats.completed?.length || 0 }} of
                        {{ stats.total || 0 }} tasks completed
                      </div>
                    </div>

                    <!-- Stats cards -->
                    <div class="grid grid-cols-3 gap-3">
                      <div class="bg-blue-50 p-3 rounded-lg text-center">
                        <div class="text-2xl font-bold text-blue-600">
                          {{ stats.total || 0 }}
                        </div>
                        <div class="text-xs text-gray-600">Total</div>
                      </div>
                      <div class="bg-green-50 p-3 rounded-lg text-center">
                        <div class="text-2xl font-bold text-green-600">
                          {{ stats.completed?.length || 0 }}
                        </div>
                        <div class="text-xs text-gray-600">Done</div>
                      </div>
                      <div class="bg-amber-50 p-3 rounded-lg text-center">
                        <div class="text-2xl font-bold text-amber-600">
                          {{ stats.active?.length || 0 }}
                        </div>
                        <div class="text-xs text-gray-600">Active</div>
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>

              <!-- Main task area -->
              <div class="lg:col-span-2">
                <!-- Unified filter bar -->
                <div class="app-card mb-6">
                  <h2
                    class="text-lg font-semibold mb-4 text-gray-800 flex items-center"
                  >
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
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                  </h2>
                  <app-task-filter></app-task-filter>
                </div>

                <div class="app-card">
                  <app-task-list
                    (editTask)="onEditTask($event)"
                  ></app-task-list>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer - sticky to the bottom -->
      <footer
        class="border-t border-gray-200 bg-white py-4 text-center text-gray-500 text-sm mt-auto"
      >
        <div class="container mx-auto px-4">
          <p>
            © {{ currentYear }} My Tasks App. Built with Angular, NgRx, and
            Tailwind CSS.
          </p>
        </div>
      </footer>
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
  currentYear = new Date().getFullYear();

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

  // Helper method to safely calculate completion percentage
  getCompletionPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return (completed / total) * 100;
  }
}
