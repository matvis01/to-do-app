import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as TaskActions from '../../store/task.actions';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-xl font-semibold mb-4">Add New Task</h2>
      
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input 
            type="text" 
            id="title" 
            formControlName="title"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter task title"
          >
          <div *ngIf="title.invalid && (title.dirty || title.touched)" class="mt-1 text-sm text-red-600">
            <div *ngIf="title.errors?.['required']">
              Title is required
            </div>
            <div *ngIf="title.errors?.['minlength']">
              Title must be at least 3 characters
            </div>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
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
        
        <div class="flex justify-end">
          <button 
            type="submit"
            [disabled]="taskForm.invalid"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class TaskFormComponent {
  taskForm: FormGroup;
  
  constructor(private fb: FormBuilder, private store: Store) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }
  
  get title() {
    return this.taskForm.get('title')!;
  }
  
  onSubmit(): void {
    if (this.taskForm.valid) {
      const { title, description } = this.taskForm.value;
      this.store.dispatch(TaskActions.addTask({ title, description }));
      this.taskForm.reset();
    }
  }
}
