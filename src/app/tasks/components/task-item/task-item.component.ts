import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <input 
            type="checkbox" 
            [checked]="task.completed"
            (change)="onToggle()"
            class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          >
          
          <div [class.line-through]="task.completed" [class.text-gray-500]="task.completed">
            <h3 class="font-medium">{{ task.title }}</h3>
            <p *ngIf="task.description" class="text-sm text-gray-600">{{ task.description }}</p>
            <p class="text-xs text-gray-500 mt-1">
              Created: {{ task.createdAt | date:'medium' }}
            </p>
          </div>
        </div>
        
        <button 
          (click)="onDelete()"
          class="text-red-500 hover:text-red-700"
          aria-label="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() toggleComplete = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  
  onToggle(): void {
    this.toggleComplete.emit(this.task.id);
  }
  
  onDelete(): void {
    this.delete.emit(this.task.id);
  }
}
