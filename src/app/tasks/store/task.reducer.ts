import { createReducer, on } from "@ngrx/store";
import { Task } from "../models/task.model";
import * as TaskActions from "./task.actions";

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: "all" | "active" | "completed";
  dateFilter: Date | null;
}

export const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filter: "all",
  dateFilter: null,
};

export const taskReducer = createReducer(
  initialState,

  on(TaskActions.loadTasks, (state) => ({
    ...state,
    loading: true,
  })),

  on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    loading: false,
  })),

  on(TaskActions.addTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
  })),

  on(TaskActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((item) => (item.id === task.id ? task : item)),
  })),

  on(TaskActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((task) => task.id !== id),
  })),

  on(TaskActions.toggleTaskStatus, (state, { id }) => ({
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ),
  })),

  on(TaskActions.setTaskFilter, (state, { filter }) => ({
    ...state,
    filter,
  })),

  on(TaskActions.setDateFilter, (state, { date }) => ({
    ...state,
    dateFilter: date,
  }))
);
