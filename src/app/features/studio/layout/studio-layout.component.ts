import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyActionModule } from 'ngx-tethys/action';
import { ThyBreadcrumbModule } from 'ngx-tethys/breadcrumb';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyCardModule } from 'ngx-tethys/card';
import { ThyDividerModule } from 'ngx-tethys/divider';
import { ThyDropdownModule } from 'ngx-tethys/dropdown';
import { ThyIconModule } from 'ngx-tethys/icon';
import { ThyLayoutModule } from 'ngx-tethys/layout';
import { ThyMenuModule } from 'ngx-tethys/menu';
import { ThyNavModule } from 'ngx-tethys/nav';
import { ThySpaceModule } from 'ngx-tethys/space';
import { ThyStatisticModule } from 'ngx-tethys/statistic';
import { filter, map, startWith } from 'rxjs';
import { DemoRuntimeExecutionStatusService } from '../../../core/services/runtime-execution-status.service';
import { DemoWorkspaceService } from '../../../core/services/workspace.service';
import type { StudioSection } from '../../../core/types/workspace.types';

@Component({
  selector: 'app-studio-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ThyLayoutModule,
    ThyCardModule,
    ThyBreadcrumbModule,
    ThyButtonModule,
    ThyNavModule,
    ThyMenuModule,
    ThyDropdownModule,
    ThyStatisticModule,
    ThyDividerModule,
    ThyIconModule,
    ThyActionModule,
    ThySpaceModule,
  ],
  templateUrl: './studio-layout.component.html',
  styleUrl: './studio-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudioLayoutComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  private readonly executionStatus = inject(DemoRuntimeExecutionStatusService);
  private readonly router = inject(Router);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
  protected readonly queryStatus = this.executionStatus.lastExecution.asReadonly();
  protected readonly projectTitle = computed(() =>
    this.workspace.projectId() === 'commerce-core' ? 'Commerce Core' : 'CRM Ops',
  );
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly activeSection = computed<StudioSection>(() => {
    const url = this.currentUrl();
    if (url.startsWith('/studio/datasource')) {
      return 'datasource';
    }
    if (url.startsWith('/studio/permission')) {
      return 'permission';
    }
    if (url.startsWith('/studio/page')) {
      return 'page';
    }
    return 'model';
  });
}
