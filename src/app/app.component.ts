import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Store } from "@ngrx/store";
import * as TaskActions from "./tasks/store/task.actions";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="min-h-screen bg-gray-50">
      <router-outlet />
    </main>

    <footer class="bg-white border-t py-4">
      <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>
          © {{ currentYear }} To-Do List App. Built with Angular, NgRx, and
          Tailwind CSS.
        </p>
      </div>
    </footer>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = "to-do-app";
  currentYear = new Date().getFullYear();

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Important: Load tasks immediately when app initializes
    // This ensures the NgRx store has tasks loaded before any components need them
    setTimeout(() => {
      this.store.dispatch(TaskActions.loadTasks());
    }, 0);
  }
}
