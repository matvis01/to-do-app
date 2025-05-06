import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import * as TaskActions from "../../store/task.actions";
import * as TaskSelectors from "../../store/task.selectors";

@Component({
  selector: "app-task-filter",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border">
      <h2 class="text-lg font-semibold mb-3">Filter Tasks</h2>

      <div class="flex flex-wrap gap-2">
        <button
          (click)="setFilter('all')"
          class="px-4 py-2 rounded-md"
          [class.bg-blue-600]="(currentFilter$ | async) === 'all'"
          [class.text-white]="(currentFilter$ | async) === 'all'"
          [class.bg-gray-100]="(currentFilter$ | async) !== 'all'"
          [class.hover:bg-gray-200]="(currentFilter$ | async) !== 'all'"
        >
          All
        </button>

        <button
          (click)="setFilter('active')"
          class="px-4 py-2 rounded-md"
          [class.bg-blue-600]="(currentFilter$ | async) === 'active'"
          [class.text-white]="(currentFilter$ | async) === 'active'"
          [class.bg-gray-100]="(currentFilter$ | async) !== 'active'"
          [class.hover:bg-gray-200]="(currentFilter$ | async) !== 'active'"
        >
          Active
        </button>

        <button
          (click)="setFilter('completed')"
          class="px-4 py-2 rounded-md"
          [class.bg-blue-600]="(currentFilter$ | async) === 'completed'"
          [class.text-white]="(currentFilter$ | async) === 'completed'"
          [class.bg-gray-100]="(currentFilter$ | async) !== 'completed'"
          [class.hover:bg-gray-200]="(currentFilter$ | async) !== 'completed'"
        >
          Completed
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskFilterComponent implements OnInit {
  currentFilter$: Observable<string>;

  constructor(private store: Store) {
    this.currentFilter$ = this.store.select(TaskSelectors.selectCurrentFilter);
  }

  ngOnInit(): void {}

  setFilter(filter: "all" | "active" | "completed"): void {
    this.store.dispatch(TaskActions.setTaskFilter({ filter }));
  }
}
