import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TaskState } from "./task.reducer";

export const selectTaskState = createFeatureSelector<TaskState>("tasks");

export const selectAllTasks = createSelector(
  selectTaskState,
  (state: TaskState) => state.tasks
);

export const selectCompletedTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => task.completed)
);

export const selectActiveTasks = createSelector(selectAllTasks, (tasks) =>
  tasks.filter((task) => !task.completed)
);

export const selectTasksLoading = createSelector(
  selectTaskState,
  (state: TaskState) => state.loading
);

export const selectTasksError = createSelector(
  selectTaskState,
  (state: TaskState) => state.error
);

export const selectCurrentFilter = createSelector(
  selectTaskState,
  (state: TaskState) => state.filter
);

export const selectDateFilter = createSelector(
  selectTaskState,
  (state: TaskState) => state.dateFilter
);

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const selectFilteredTasks = createSelector(
  selectAllTasks,
  selectCurrentFilter,
  selectDateFilter,
  (tasks, statusFilter, dateFilter) => {
    // First filter by status
    let filteredTasks = tasks;

    if (statusFilter === "active") {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (statusFilter === "completed") {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    // Then filter by date if dateFilter is set
    if (dateFilter) {
      filteredTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return isSameDay(taskDate, dateFilter);
      });
    }

    return filteredTasks;
  }
);
