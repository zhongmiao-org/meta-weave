import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyCardModule } from 'ngx-tethys/card';
import { DemoWorkspaceService } from '../../../../core/services/workspace.service';

@Component({
  selector: 'app-route-config-page',
  imports: [ThyCardModule],
  templateUrl: './route-config-page.component.html',
  styleUrl: './route-config-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteConfigPageComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
}
