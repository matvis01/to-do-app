import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of, EMPTY } from "rxjs";
import { catchError, map, mergeMap, switchMap, filter } from "rxjs/operators";
import { TaskService } from "../../core/services/task.service";
import * as TaskActions from "./task.actions";

@Injectable()
export class TaskEffects {
  constructor(private actions$: Actions, private taskService: TaskService) {}

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
          catchError((error) =>
            of({ type: "[Task] Load Tasks Error", payload: error })
          )
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
          catchError((error) =>
            of({ type: "[Task] Add Task Error", payload: error })
          )
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
          catchError((error) =>
            of({ type: "[Task] Update Task Error", payload: error })
          )
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
          catchError((error) =>
            of({ type: "[Task] Delete Task Error", payload: error })
          )
        )
      )
    )
  );

  toggleTaskStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.toggleTaskStatus),
      mergeMap(({ id }) => {
        if (!id) {
          // Handle case when ID is undefined or empty
          console.error("Task ID is undefined in toggleTaskStatus effect");
          return EMPTY;
        }

        // First get the task
        return this.taskService.getTask(id).pipe(
          // Only proceed if task exists
          filter(
            (task): task is NonNullable<typeof task> => task !== undefined
          ),
          mergeMap((task) => {
            const updatedTask = { ...task, completed: !task.completed };
            return this.taskService.updateTask(updatedTask).pipe(
              map(() => TaskActions.updateTaskSuccess({ task: updatedTask })),
              catchError((error) => {
                console.error("Error updating task:", error);
                return of({ type: "[Task] Toggle Task Error", payload: error });
              })
            );
          }),
          catchError((error) => {
            console.error("Error getting task:", error);
            return of({ type: "[Task] Toggle Task Error", payload: error });
          })
        );
      })
    )
  );
}
