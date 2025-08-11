import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';

declare global {
  interface Window {
    ngPlatform?: any;
  }
}

if (!window.ngPlatform) {
  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptors([authInterceptor]))
    ]
  }).then(platformRef => {
    window.ngPlatform = platformRef; 
  }).catch(err => console.error(err));
}
