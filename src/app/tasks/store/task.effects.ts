import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of, EMPTY } from "rxjs";
import { catchError, map, mergeMap, switchMap, filter } from "rxjs/operators";
import { TaskService } from "../../core/services/task.service";
import * as TaskActions from "./task.actions";

@Injectable()
export class TaskEffects {
  constructor(private actions$: Actions, private taskService: TaskService) {}

  // Helper method for consistent error handling
  private handleError(operation: string, error: any) {
    console.error(`Error ${operation}:`, error);
    return of({ type: `[Task] ${operation} Error`, payload: error });
  }

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
          catchError((error) => this.handleError("Load Tasks", error))
        )
      )
    )
  );

  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.addTask),
      mergeMap(({ title, description, dueDate }) =>
        this.taskService.addTask(title, description, dueDate).pipe(
          map((task) => TaskActions.addTaskSuccess({ task })),
          catchError((error) => this.handleError("Add Task", error))
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      mergeMap(({ task }) =>
        this.taskService.updateTask(task).pipe(
          map(() => TaskActions.updateTaskSuccess({ task })),
          catchError((error) => this.handleError("Update Task", error))
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      mergeMap(({ id }) =>
        this.taskService.deleteTask(id).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id })),
          catchError((error) => this.handleError("Delete Task", error))
        )
      )
    )
  );

  toggleTaskStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.toggleTaskStatus),
      mergeMap(({ id }) => {
        if (!id) {
          console.error("Task ID is undefined in toggleTaskStatus effect");
          return EMPTY;
        }

        return this.taskService.getTask(id).pipe(
          filter(
            (task): task is NonNullable<typeof task> => task !== undefined
          ),
          mergeMap((task) => {
            const updatedTask = { ...task, completed: !task.completed };
            return this.taskService.updateTask(updatedTask).pipe(
              map(() => TaskActions.updateTaskSuccess({ task: updatedTask })),
              catchError((error) => this.handleError("Toggle Task", error))
            );
          }),
          catchError((error) => this.handleError("Get Task", error))
        );
      })
    )
  );
}
