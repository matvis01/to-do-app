import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Observable, of } from "rxjs";
import { Task } from "../../tasks/models/task.model";
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private readonly STORAGE_KEY = "to-do-app-tasks";
  private tasks: Task[] = [];
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Initialize with initial data if needed
    if (this.isBrowser) {
      this.loadTasksFromStorage();
    } else {
      // Server-side initial data
      this.tasks = this.getInitialTasks();
    }
  }

  private loadTasksFromStorage(): void {
    try {
      const storedTasks = localStorage.getItem(this.STORAGE_KEY);

      if (!storedTasks) {
        // Initialize with default tasks if storage is empty
        this.tasks = this.getInitialTasks();
        this.saveTasksToStorage();
      } else {
        // Parse stored tasks and ensure dates are properly converted
        const parsedTasks = JSON.parse(storedTasks);
        this.tasks = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
      }
    } catch (error) {
      console.error("Error loading tasks from storage:", error);
      this.tasks = this.getInitialTasks();
    }
  }

  private saveTasksToStorage(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
      } catch (error) {
        console.error("Error saving tasks to storage:", error);
      }
    }
  }

  private getInitialTasks(): Task[] {
    return [
      {
        id: uuidv4(),
        title: "Learn Angular",
        description: "Study Angular framework basics and advanced concepts",
        completed: false,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        title: "Master NgRx",
        description: "Learn state management with NgRx",
        completed: false,
        createdAt: new Date(),
      },
    ];
  }

  getTasks(): Observable<Task[]> {
    if (this.isBrowser) {
      this.loadTasksFromStorage();
    }
    return of([...this.tasks]); // Return a copy to prevent unintended mutations
  }

  getTask(id: string): Observable<Task | undefined> {
    if (this.isBrowser) {
      this.loadTasksFromStorage();
    }
    const task = this.tasks.find((t: Task) => t.id === id);
    return of(task ? { ...task } : undefined); // Return a copy if found
  }

  addTask(
    title: string,
    description?: string,
    dueDate?: Date
  ): Observable<Task> {
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      dueDate,
    };

    this.tasks = [...this.tasks, newTask];
    this.saveTasksToStorage();

    return of({ ...newTask }); // Return a copy
  }

  updateTask(updatedTask: Task): Observable<void> {
    this.tasks = this.tasks.map((task) =>
      task.id === updatedTask.id ? { ...updatedTask } : task
    );

    this.saveTasksToStorage();
    return of(undefined);
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter((t: Task) => t.id !== id);
    this.saveTasksToStorage();
    return of(undefined);
  }
}
