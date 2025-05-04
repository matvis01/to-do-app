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

    // Initialize with sample data if needed
    if (this.isBrowser) {
      const storedTasks = localStorage.getItem(this.STORAGE_KEY);

      if (!storedTasks) {
        const initialTasks: Task[] = [
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
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialTasks));
        this.tasks = initialTasks;
      } else {
        this.tasks = JSON.parse(storedTasks);
      }
    } else {
      // Server-side initial data
      this.tasks = [
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
  }

  getTasks(): Observable<Task[]> {
    if (this.isBrowser) {
      const tasks = localStorage.getItem(this.STORAGE_KEY);
      this.tasks = tasks ? JSON.parse(tasks) : [];
    }
    return of(this.tasks);
  }

  getTask(id: string): Observable<Task | undefined> {
    if (this.isBrowser) {
      const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
      this.tasks = tasks;
    }
    const task = this.tasks.find((t: Task) => t.id === id);
    return of(task);
  }

  addTask(title: string, description?: string): Observable<Task> {
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };

    this.tasks.push(newTask);

    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    }

    return of(newTask);
  }

  updateTask(updatedTask: Task): Observable<void> {
    const index = this.tasks.findIndex((t: Task) => t.id === updatedTask.id);

    if (index !== -1) {
      this.tasks[index] = updatedTask;

      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
      }
    }

    return of(undefined);
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter((t: Task) => t.id !== id);

    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
    }

    return of(undefined);
  }
}
