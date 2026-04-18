import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyBreadcrumbModule } from 'ngx-tethys/breadcrumb';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyCardModule } from 'ngx-tethys/card';
import { ThyLayoutModule } from 'ngx-tethys/layout';
import { DemoWorkspaceService } from '../../core/services/workspace.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ThyLayoutModule, ThyCardModule, ThyBreadcrumbModule, ThyButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
}
