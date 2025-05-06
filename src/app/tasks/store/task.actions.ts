import { createAction, props } from "@ngrx/store";
import { Task } from "../models/task.model";

export const loadTasks = createAction("[Task] Load Tasks");
export const loadTasksSuccess = createAction(
  "[Task] Load Tasks Success",
  props<{ tasks: Task[] }>()
);

export const addTask = createAction(
  "[Task] Add Task",
  props<{ title: string; description?: string; dueDate?: Date }>()
);
export const addTaskSuccess = createAction(
  "[Task] Add Task Success",
  props<{ task: Task }>()
);

export const updateTask = createAction(
  "[Task] Update Task",
  props<{ task: Task }>()
);
export const updateTaskSuccess = createAction(
  "[Task] Update Task Success",
  props<{ task: Task }>()
);

export const deleteTask = createAction(
  "[Task] Delete Task",
  props<{ id: string }>()
);
export const deleteTaskSuccess = createAction(
  "[Task] Delete Task Success",
  props<{ id: string }>()
);

export const toggleTaskStatus = createAction(
  "[Task] Toggle Task Status",
  props<{ id: string }>()
);

export const setTaskFilter = createAction(
  "[Task] Set Task Filter",
  props<{ filter: "all" | "active" | "completed" }>()
);

export const setDateFilter = createAction(
  "[Task] Set Date Filter",
  props<{ date: Date | null }>()
);
