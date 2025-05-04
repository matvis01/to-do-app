import { Routes } from "@angular/router";
import { TaskPageComponent } from "./tasks/pages/task-page/task-page.component";

export const routes: Routes = [
  { path: "", component: TaskPageComponent },
  { path: "**", redirectTo: "" },
];
