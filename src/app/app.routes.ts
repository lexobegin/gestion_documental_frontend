import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth/auth.guard';
import { DashboardComponent } from './components/home/dashboard/dashboard.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AutoListComponent } from './components/auto/auto-list/auto-list.component';
import { AutoCreateComponent } from './components/auto/auto-create/auto-create.component';
import { AutoUpdateComponent } from './components/auto/auto-update/auto-update.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      //Dashboard
      { path: 'dashboard', component: DashboardComponent },

      //Auto
      { path: 'autos', component: AutoListComponent },
      { path: 'autos/crear', component: AutoCreateComponent },
      { path: 'autos/editar/:id', component: AutoUpdateComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' },
];
