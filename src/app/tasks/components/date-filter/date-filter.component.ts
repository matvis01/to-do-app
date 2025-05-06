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
    <div class="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h2 class="text-lg font-semibold mb-3">Filter by Date</h2>

      <div class="flex flex-col">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Choose a date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            placeholder="MM/DD/YYYY"
            (dateChange)="onDateChange($event)"
            [value]="selectedDate$ | async"
          />
          <mat-hint>Filter tasks by creation date</mat-hint>
          <mat-datepicker-toggle
            matIconSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="flex justify-end mt-2">
          <button
            *ngIf="selectedDate$ | async"
            mat-button
            color="warn"
            class="text-red-500"
            (click)="clearDateFilter()"
          >
            Clear Date Filter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
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
