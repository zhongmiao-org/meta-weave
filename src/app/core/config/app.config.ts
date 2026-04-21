import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ThyIconRegistry } from 'ngx-tethys/icon';
import { routes } from '../../app.routes';

function provideTethysIcons() {
  return () => {
    const iconRegistry = inject(ThyIconRegistry);
    iconRegistry.addSvgIconSet('/assets/icons/defs/svg/sprite.defs.svg');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: provideTethysIcons,
    },
  ],
};
