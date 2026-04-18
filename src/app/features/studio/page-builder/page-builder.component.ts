import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyCardModule } from 'ngx-tethys/card';
import { ThyNavModule } from 'ngx-tethys/nav';
import { DemoWorkspaceService } from '../../../core/services/workspace.service';

@Component({
  selector: 'app-page-builder',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ThyCardModule, ThyNavModule],
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
}
