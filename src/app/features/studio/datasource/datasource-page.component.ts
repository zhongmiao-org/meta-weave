import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyCardModule } from 'ngx-tethys/card';
import { ThyEmptyModule } from 'ngx-tethys/empty';
import { ThyStatisticModule } from 'ngx-tethys/statistic';
import { ThyTagModule } from 'ngx-tethys/tag';
import { DemoWorkspaceService } from '../../../core/services/workspace.service';

@Component({
  selector: 'app-datasource-page',
  imports: [ThyCardModule, ThyButtonModule, ThyTagModule, ThyStatisticModule, ThyEmptyModule],
  templateUrl: './datasource-page.component.html',
  styleUrl: './datasource-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasourcePageComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
}
