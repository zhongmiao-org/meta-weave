import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((module) => module.routes),
  },
  {
    path: 'studio',
    loadChildren: () => import('./features/studio/studio.routes').then((module) => module.routes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
