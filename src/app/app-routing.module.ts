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

  // Lazy load del feature "tournaments"
  {
    path: 'tournaments',
    loadChildren: () =>
      import('./features/tournaments/tournaments.module').then(m => m.TournamentsModule),
    title: 'Torneos · Fútbol Fantasy',
  },

  {
  path: 'perfil',
  loadChildren: () =>
    import('./features/perfil/perfil.module').then(m => m.PerfilModule),
  title: 'Mi perfil · Fútbol Fantasy',
  },


  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,   // precarga módulos cuando el navegador está idle
    scrollPositionRestoration: 'enabled',    // vuelve al tope / restaura al hacer back
    anchorScrolling: 'enabled',              // permite navegar a #anclas
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
