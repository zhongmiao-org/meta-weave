import { Routes } from '@angular/router';
import { StudioLayoutComponent } from './layout/studio-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: StudioLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'model',
      },
      {
        path: 'model',
        loadComponent: () =>
          import('./model/model-page.component').then((module) => module.ModelPageComponent),
      },
      {
        path: 'datasource',
        loadComponent: () =>
          import('./datasource/datasource-page.component').then(
            (module) => module.DatasourcePageComponent,
          ),
      },
      {
        path: 'permission',
        loadComponent: () =>
          import('./permission/permission-page.component').then(
            (module) => module.PermissionPageComponent,
          ),
      },
      {
        path: 'page',
        loadChildren: () =>
          import('./page-builder/page-builder.routes').then((module) => module.routes),
      },
    ],
  },
];
