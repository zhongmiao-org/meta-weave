import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgxLowcodeRendererComponent } from '@zhongmiao/ngx-lowcode-renderer';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyCardModule } from 'ngx-tethys/card';
import { DemoRuntimeExecutionStatusService } from '../../../../core/services/runtime-execution-status.service';
import { DemoWorkspaceService } from '../../../../core/services/workspace.service';

@Component({
  selector: 'app-page-preview',
  imports: [NgxLowcodeRendererComponent, ThyCardModule],
  templateUrl: './page-preview.component.html',
  styleUrl: './page-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePreviewComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  private readonly executionStatus = inject(DemoRuntimeExecutionStatusService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
  protected readonly queryStatus = this.executionStatus.lastExecution.asReadonly();
}
