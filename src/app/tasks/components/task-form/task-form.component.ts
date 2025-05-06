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
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-xl font-semibold mb-4">
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter task title"
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

        <div class="mb-4">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter task description"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-2">
          <button
            *ngIf="isEditMode"
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="taskForm.invalid"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
