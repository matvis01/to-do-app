import { mergeApplicationConfig } from "@angular/core";
import { appConfig } from "./app.config";
import { provideServerRendering } from "@angular/platform-server";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { importProvidersFrom } from "@angular/core";

const serverConfig = {
  providers: [
    provideServerRendering(),
    importProvidersFrom(NoopAnimationsModule), // Use NoopAnimationsModule for server-side
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
