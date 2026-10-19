import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { App } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(APP_ROUTES, withComponentInputBinding())],
}).catch((err) => console.error(err));
