import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Store } from "@ngrx/store";
import * as TaskActions from "../../store/task.actions";
import { Task } from "../../models/task.model";
import { MaterialModule } from "../../../shared/material.module";

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-800 flex items-center">
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {{ isEditMode ? "Edit Task" : "Add New Task" }}
      </h2>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            formControlName="title"
            class="form-control"
            placeholder="What needs to be done?"
            #titleInput
          />
          <div
            *ngIf="title.invalid && (title.dirty || title.touched)"
            class="mt-1 text-sm text-red-600"
          >
            <div *ngIf="title.errors?.['required']">Title is required</div>
            <div *ngIf="title.errors?.['minlength']">
              Title must be at least 3 characters
            </div>
          </div>
        </div>

        <div class="mb-5">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span class="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            class="form-control"
            placeholder="Add details about this task..."
          ></textarea>
        </div>

        <div class="mb-5">
          <label
            for="dueDate"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date & Time
            <span class="text-gray-400 text-xs">(optional)</span>
          </label>

          <!-- Date and time pickers in a flex row -->
          <div class="flex flex-wrap gap-2">
            <!-- Date picker -->
            <div class="flex-1 min-w-[200px]">
              <mat-form-field appearance="outline" class="w-full">
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="dueDate"
                  placeholder="Choose a date"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- Time picker -->
            <div class="flex-1 min-w-[200px]">
              <mat-form-field appearance="outline" class="w-full">
                <input
                  matInput
                  formControlName="dueTime"
                  [ngxMatTimepicker]="timePicker"
                  placeholder="Choose a time"
                />
                <mat-icon matSuffix (click)="timePicker.open()"
                  >schedule</mat-icon
                >
                <ngx-mat-timepicker #timePicker></ngx-mat-timepicker>
              </mat-form-field>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <button
            *ngIf="isEditMode"
            type="button"
            (click)="onCancel()"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="taskForm.invalid"
            class="btn"
            [ngClass]="isEditMode ? 'btn-success' : 'btn-primary'"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ isEditMode ? "Update Task" : "Add Task" }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class TaskFormComponent implements OnInit, OnChanges {
  @Input() taskToEdit: Task | null = null;
  @Output() cancelEdit = new EventEmitter<void>();

  taskForm!: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["taskToEdit"] && changes["taskToEdit"].currentValue) {
      this.isEditMode = true;
      this.populateForm(this.taskToEdit!);
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      id: [""],
      title: ["", [Validators.required, Validators.minLength(3)]],
      description: [""],
      completed: [false],
      createdAt: [new Date()],
      dueDate: [null],
      dueTime: [null],
    });
  }

  private populateForm(task: Task): void {
    let dueTime = null;
    let dueDate = null;

    if (task.dueDate) {
      const date = new Date(task.dueDate);
      dueDate = date;

      // Format time as HH:mm
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      dueTime = `${hours}:${minutes}`;
    }

    this.taskForm.patchValue({
      id: task.id,
      title: task.title,
      description: task.description || "",
      completed: task.completed,
      createdAt: task.createdAt,
      dueDate: dueDate,
      dueTime: dueTime,
    });
  }

  get title() {
    return this.taskForm.get("title")!;
  }

  onCancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const title = formValue.title.trim();
      const description = formValue.description
        ? formValue.description.trim()
        : undefined;

      // Combine date and time if both are provided
      let dueDate = formValue.dueDate ? new Date(formValue.dueDate) : undefined;

      if (dueDate && formValue.dueTime) {
        try {
          // Parse the time string correctly
          const timeString = formValue.dueTime;
          // Log for debugging
          console.log("Time string from picker:", timeString);

          // Handle different time formats that might come from the picker
          let hours = 0;
          let minutes = 0;

          if (timeString.includes(":")) {
            const [h, m] = timeString.split(":");
            hours = parseInt(h, 10);
            minutes = parseInt(m, 10);
          } else {
            // If for some reason we get just hours
            hours = parseInt(timeString, 10);
          }

          // Make sure we have valid numbers
          hours = isNaN(hours) ? 0 : hours;
          minutes = isNaN(minutes) ? 0 : minutes;

          console.log(`Setting time to ${hours}:${minutes}`);
          dueDate.setHours(hours, minutes, 0, 0);
        } catch (error) {
          console.error("Error setting time:", error);
        }
      } else if (dueDate) {
        // If date is set but time is not, set time to start of day (midnight)
        dueDate.setHours(0, 0, 0, 0);
      }

      if (this.isEditMode) {
        const updatedTask: Task = {
          id: formValue.id,
          title,
          description,
          completed: formValue.completed,
          createdAt: formValue.createdAt,
          dueDate,
        };

        this.store.dispatch(TaskActions.updateTask({ task: updatedTask }));
        this.cancelEdit.emit();
      } else {
        this.store.dispatch(
          TaskActions.addTask({ title, description, dueDate })
        );
      }

      this.resetForm();
    }
  }

  private resetForm(): void {
    this.isEditMode = false;
    this.taskForm.reset({
      id: "",
      title: "",
      description: "",
      completed: false,
      createdAt: new Date(),
      dueDate: null,
      dueTime: null,
    });

    Object.keys(this.taskForm.controls).forEach((key) => {
      const control = this.taskForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }
}
