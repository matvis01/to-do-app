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
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    // Load tasks immediately when app initializes
    this.store.dispatch(TaskActions.loadTasks());
  }
}
