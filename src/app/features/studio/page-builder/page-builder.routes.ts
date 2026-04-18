import { Routes } from '@angular/router';
import { provideLowcodeRuntime } from '../../../core/config/lowcode.providers';
import { PageBuilderComponent } from './page-builder.component';

export const routes: Routes = [
  {
    path: '',
    component: PageBuilderComponent,
    providers: [provideLowcodeRuntime()],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'designer',
      },
      {
        path: 'designer',
        loadComponent: () =>
          import('./designer/page-designer.component').then(
            (module) => module.PageDesignerComponent,
          ),
      },
      {
        path: 'preview',
        loadComponent: () =>
          import('./preview/page-preview.component').then((module) => module.PagePreviewComponent),
      },
      {
        path: 'route-config',
        loadComponent: () =>
          import('./route-config/route-config-page.component').then(
            (module) => module.RouteConfigPageComponent,
          ),
      },
    ],
  },
];
