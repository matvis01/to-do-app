import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  importProvidersFrom,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { taskReducer } from "./tasks/store/task.reducer";
import { TaskEffects } from "./tasks/store/task.effects";
import { EffectsModule } from "@ngrx/effects";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideStore({ tasks: taskReducer }),
    importProvidersFrom(EffectsModule.forRoot([TaskEffects])),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
