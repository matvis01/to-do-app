import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Task } from "../../models/task.model";

@Component({
  selector: "app-task-item",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="task-item p-4 rounded-lg border shadow-sm mb-3 transition-all duration-200 hover:shadow-md"
      [class.completed]="task.completed"
      [class.border-gray-100]="!task.completed"
      [class.border-green-200]="task.completed"
      [class.bg-green-50]="task.completed"
    >
      <!-- Main task content that can be clicked to expand/collapse -->
      <div
        class="flex items-start justify-between cursor-pointer"
        (click)="toggleDetails()"
      >
        <div class="flex items-start space-x-3 flex-1">
          <!-- Custom styled checkbox -->
          <div
            (click)="onToggle($event)"
            class="custom-checkbox mt-1 flex-shrink-0"
            [class.checked]="task.completed"
            aria-label="Toggle task completion"
            role="checkbox"
            [attr.aria-checked]="task.completed"
            tabindex="0"
            (keydown.space)="onToggle($event); $event.preventDefault()"
          ></div>

          <div
            [class.line-through]="task.completed"
            [class.text-gray-500]="task.completed"
            class="flex-1"
          >
            <!-- Task title with priority indicator -->
            <div class="flex items-center">
              <h3 class="font-medium text-gray-800 text-lg">
                {{ task.title }}
              </h3>
              <span
                *ngIf="isTaskDueSoon()"
                class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full"
                [ngClass]="
                  isTaskOverdue()
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                "
              >
                {{ isTaskOverdue() ? "Overdue" : "Due soon" }}
              </span>

              <!-- Expand/collapse indicator -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 ml-2 text-gray-400 transition-transform duration-200"
                [class.rotate-180]="isExpanded"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <!-- Date information in a compact format when not expanded -->
            <div *ngIf="!isExpanded" class="flex flex-wrap gap-2 mt-1">
              <div class="text-xs text-gray-500">
                Created: {{ task.createdAt | date : "MMM d, y" }}
              </div>
              <div
                *ngIf="task.dueDate"
                class="text-xs"
                [ngClass]="getTextColorClass()"
              >
                Due: {{ task.dueDate | date : "MMM d, y" }}
              </div>
            </div>
          </div>
        </div>

        <div
          class="task-actions flex space-x-1"
          (click)="$event.stopPropagation()"
        >
          <button
            (click)="onEdit()"
            class="p-1.5 rounded-full text-blue-500 hover:bg-blue-50 transition-colors"
            aria-label="Edit task"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            (click)="onDelete()"
            class="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Delete task"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Expanded details section -->
      <div
        *ngIf="isExpanded"
        class="mt-3 pt-3 border-t border-gray-200 animate-fadeIn"
      >
        <!-- Description section - show actual description or "No description added" -->
        <div
          class="text-sm text-gray-700 mb-3 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
        >
          <div class="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span *ngIf="task.description">{{ task.description }}</span>
            <span *ngIf="!task.description" class="text-gray-400 italic"
              >No description added</span
            >
          </div>
        </div>

        <!-- Detailed date information in a card-like format -->
        <div class="flex flex-wrap gap-2">
          <!-- Created date badge -->
          <div
            class="bg-gray-100 rounded-lg px-3 py-1 text-xs flex items-center shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-gray-500 font-medium mr-1">Created:</span>
            <span class="text-gray-700">{{
              task.createdAt | date : "MMM d, y, h:mm a"
            }}</span>
          </div>

          <!-- Due date badge with conditional colors -->
          <div
            *ngIf="task.dueDate"
            class="rounded-lg px-3 py-1 text-xs flex items-center shadow-sm"
            [ngClass]="getDueDateClasses()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 mr-1"
              [ngClass]="
                isTaskOverdue()
                  ? 'text-red-500'
                  : isTaskDueSoon()
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              "
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
            <span
              class="font-medium mr-1"
              [ngClass]="
                isTaskOverdue()
                  ? 'text-red-700'
                  : isTaskDueSoon()
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              "
              >Due:</span
            >
            <span
              [ngClass]="
                isTaskOverdue()
                  ? 'text-red-900'
                  : isTaskDueSoon()
                  ? 'text-amber-900'
                  : 'text-emerald-900'
              "
            >
              {{ task.dueDate | date : "MMM d, y, h:mm a" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() toggleComplete = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();

  isExpanded = false;

  // Toggle the expanded state
  toggleDetails(): void {
    this.isExpanded = !this.isExpanded;
  }

  // Calculate if a task is overdue (due date is in the past)
  isTaskOverdue(): boolean {
    if (!this.task.dueDate) return false;
    const dueDate = new Date(this.task.dueDate);
    return dueDate < new Date() && !this.task.completed;
  }

  // Calculate if a task is due soon (within the next 2 days)
  isTaskDueSoon(): boolean {
    if (!this.task.dueDate || this.task.completed) return false;
    const dueDate = new Date(this.task.dueDate);
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);

    return dueDate > today && dueDate <= twoDaysFromNow;
  }

  // Get CSS classes for due date based on status
  getDueDateClasses(): string {
    if (this.isTaskOverdue()) {
      return "bg-red-100";
    } else if (this.isTaskDueSoon()) {
      return "bg-amber-100";
    } else if (this.task.completed) {
      return "bg-gray-100";
    } else {
      return "bg-emerald-100";
    }
  }

  // Get text color class for compact due date display
  getTextColorClass(): string {
    if (this.isTaskOverdue()) {
      return "text-red-600";
    } else if (this.isTaskDueSoon()) {
      return "text-amber-600";
    } else if (this.task.completed) {
      return "text-gray-500";
    } else {
      return "text-emerald-600";
    }
  }

  onToggle(event: Event): void {
    event.stopPropagation(); // Prevent toggling the expanded state
    this.toggleComplete.emit(this.task.id);
  }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }

  onEdit(): void {
    this.edit.emit({ ...this.task });
  }
}
