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

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    });
  }

  private populateForm(task: Task): void {
    this.taskForm.patchValue({
      id: task.id,
      title: task.title,
      description: task.description || "",
      completed: task.completed,
      createdAt: task.createdAt,
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

      if (this.isEditMode) {
        const updatedTask: Task = {
          id: formValue.id,
          title,
          description,
          completed: formValue.completed,
          createdAt: formValue.createdAt,
        };

        this.store.dispatch(TaskActions.updateTask({ task: updatedTask }));
        this.cancelEdit.emit();
      } else {
        this.store.dispatch(TaskActions.addTask({ title, description }));
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
    });

    Object.keys(this.taskForm.controls).forEach((key) => {
      const control = this.taskForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }
}
