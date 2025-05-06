import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="task-item p-4 rounded-lg border mb-3 transition-all duration-200"
      [class.completed]="task.completed"
      [class.border-gray-100]="!task.completed"
      [class.border-green-100]="task.completed"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-3">
          <!-- Custom styled checkbox -->
          <div 
            (click)="onToggle()"
            class="custom-checkbox mt-1"
            [class.checked]="task.completed"
            aria-label="Toggle task completion"
            role="checkbox"
            [attr.aria-checked]="task.completed"
            tabindex="0"
            (keydown.space)="onToggle(); $event.preventDefault()"
          ></div>
          
          <div [class.line-through]="task.completed" [class.text-gray-500]="task.completed" class="flex-1">
            <h3 class="font-medium text-gray-800">{{ task.title }}</h3>
            <p *ngIf="task.description" class="text-sm text-gray-600 mt-1">{{ task.description }}</p>
            <p class="text-xs text-gray-500 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ task.createdAt | date:'medium' }}
            </p>
          </div>
        </div>
        
        <div class="task-actions flex space-x-1">
          <button 
            (click)="onEdit()"
            class="p-1.5 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button 
            (click)="onDelete()"
            class="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() toggleComplete = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();
  
  onToggle(): void {
    this.toggleComplete.emit(this.task.id);
  }
  
  onDelete(): void {
    this.delete.emit(this.task.id);
  }
  
  onEdit(): void {
    this.edit.emit({...this.task});
  }
}
