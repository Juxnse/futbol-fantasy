// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, title: 'Inicio · Fútbol Fantasy' },
  { path: 'register', component: RegisterComponent, title: 'Registro · Fútbol Fantasy' },
  { path: 'login', component: LoginComponent, title: 'Iniciar sesión · Fútbol Fantasy' },

  // Lazy load del feature "equipos"
  {
    path: 'equipos',
    loadChildren: () =>
      import('./features/equipos/equipos.module').then(m => m.EquiposModule),
    title: 'Equipos · Fútbol Fantasy',
  },

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,   // precarga módulos en idle
    scrollPositionRestoration: 'enabled',    // vuelve al tope / restaura en back
    anchorScrolling: 'enabled',              // permite #anclas
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
