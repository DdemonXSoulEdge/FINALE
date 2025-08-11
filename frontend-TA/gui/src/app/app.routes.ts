import { Routes } from '@angular/router';
import { Error404Component } from './pages/errors/error-404/error-404.component';
import { DashlogsComponent } from './pages/dashlogs/dashlogs.component';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: "/auth/login", pathMatch: 'full' },
  { path: 'tasks', loadChildren: () => import('./pages/tasks/tasks.module').then(m => m.TasksModule) },
  { path: "auth", loadChildren: () => import('./pages/auth/auth.routes').then(n => n.authRoutes) },
  { path: 'dashlogs', component: DashlogsComponent, canActivate: [AuthGuard]}, // <-- Agrega la coma al final
  { path: '**', component: Error404Component }
];