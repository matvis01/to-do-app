import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../../shared/material.module";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import * as TaskActions from "../../store/task.actions";
import * as TaskSelectors from "../../store/task.selectors";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";

@Component({
  selector: "app-date-filter",
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div>
      <!-- Label instead of full header -->
      <div class="text-sm font-medium text-gray-700 mb-2">
        Filter by creation date
      </div>

      <!-- Reduced width of date picker and improved button placement -->
      <div class="flex flex-wrap items-end gap-3">
        <mat-form-field appearance="outline" class="flex-1 max-w-[250px]">
          <mat-label>Choose a date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            placeholder="MM/DD/YYYY"
            (dateChange)="onDateChange($event)"
            [value]="selectedDate$ | async"
          />
          <mat-datepicker-toggle
            matIconSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <button
          *ngIf="selectedDate$ | async"
          class="btn btn-secondary h-10 flex items-center text-sm mb-[1.34375em]"
          (click)="clearDateFilter()"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Clear
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      /* Add custom styles to limit the width of the date picker */
      ::ng-deep .mat-datepicker-content {
        max-width: 300px !important;
      }
    `,
  ],
})
export class DateFilterComponent implements OnInit {
  selectedDate$: Observable<Date | null>;

  constructor(private store: Store) {
    this.selectedDate$ = this.store.select(TaskSelectors.selectDateFilter);
  }

  ngOnInit(): void {}

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = event.value;
    this.store.dispatch(TaskActions.setDateFilter({ date: selectedDate }));
  }

  clearDateFilter(): void {
    this.store.dispatch(TaskActions.setDateFilter({ date: null }));
  }
}
