import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../../shared/material.module";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import * as TaskActions from "../../store/task.actions";
import * as TaskSelectors from "../../store/task.selectors";

type FilterType = "all" | "active" | "completed";

interface FilterOption {
  value: FilterType;
  label: string;
}

@Component({
  selector: "app-task-filter",
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <!-- Status filters -->
        <div class="flex flex-wrap gap-2">
          <ng-container *ngFor="let option of filterOptions">
            <button
              (click)="setFilter(option.value)"
              class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center"
              [class.bg-blue-600]="(currentFilter$ | async) === option.value"
              [class.text-white]="(currentFilter$ | async) === option.value"
              [class.bg-gray-100]="(currentFilter$ | async) !== option.value"
              [class.text-gray-700]="(currentFilter$ | async) !== option.value"
              [class.hover:bg-gray-200]="
                (currentFilter$ | async) !== option.value
              "
            >
              <svg
                *ngIf="(currentFilter$ | async) === option.value"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ option.label }}
            </button>
          </ng-container>
        </div>

        <!-- Date filter button & clear button -->
        <div class="flex items-center gap-2">
          <button
            *ngIf="selectedDate$ | async"
            (click)="clearDateFilter()"
            class="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200"
          >
            Clear Date
          </button>

          <button
            [matMenuTriggerFor]="calendarMenu"
            class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-gray-700 flex items-center"
            [class.bg-blue-100]="selectedDate$ | async"
            [class.text-blue-700]="selectedDate$ | async"
            [class.hover:bg-blue-200]="selectedDate$ | async"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
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
          </button>

          <mat-menu #calendarMenu="matMenu" xPosition="before">
            <div class="p-2" (click)="$event.stopPropagation()">
              <mat-calendar
                [(selected)]="selectedDate"
                (selectedChange)="onDateSelected($event)"
              ></mat-calendar>
            </div>
          </mat-menu>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TaskFilterComponent implements OnInit {
  currentFilter$: Observable<string>;
  selectedDate$: Observable<Date | null>;
  selectedDate: Date | null = null;

  filterOptions: FilterOption[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  constructor(private store: Store) {
    this.currentFilter$ = this.store.select(TaskSelectors.selectCurrentFilter);
    this.selectedDate$ = this.store.select(TaskSelectors.selectDateFilter);

    // Keep the local selectedDate in sync with the store
    this.selectedDate$.subscribe((date) => {
      this.selectedDate = date;
    });
  }

  ngOnInit(): void {}

  setFilter(filter: FilterType): void {
    this.store.dispatch(TaskActions.setTaskFilter({ filter }));
  }

  onDateSelected(date: Date): void {
    this.store.dispatch(TaskActions.setDateFilter({ date }));
  }

  clearDateFilter(): void {
    this.store.dispatch(TaskActions.setDateFilter({ date: null }));
  }
}
