import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ComponentRef,
  Component,
  EnvironmentInjector,
  OnDestroy,
  ViewContainerRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import type { NgxLowcodeDesignerComponent } from '@zhongmiao/ngx-lowcode-designer';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyCardModule } from 'ngx-tethys/card';
import { ThyStatisticModule } from 'ngx-tethys/statistic';
import { ThyTagModule } from 'ngx-tethys/tag';
import type { DslSnapshotRecord } from '../../../../core/interfaces/workspace.interfaces';
import { DemoWorkspaceService } from '../../../../core/services/workspace.service';

@Component({
  selector: 'app-page-designer',
  imports: [ThyCardModule, ThyButtonModule, ThyStatisticModule, ThyTagModule],
  templateUrl: './page-designer.component.html',
  styleUrl: './page-designer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDesignerComponent implements AfterViewInit, OnDestroy {
  protected readonly workspace = inject(DemoWorkspaceService);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly router = inject(Router);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
  protected readonly snapshots = signal<DslSnapshotRecord[]>([]);
  protected readonly autoSnapshot = signal(true);
  protected readonly designerStatus = signal<'loading' | 'ready' | 'error'>('loading');
  private readonly designerHost = viewChild.required('designerHost', { read: ViewContainerRef });
  private readonly designerReady = signal(false);
  private designerRef: ComponentRef<NgxLowcodeDesignerComponent> | null = null;
  private autoSnapshotTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.refreshSnapshots();
    effect(() => {
      this.workspace.snapshotFingerprint();
      if (!this.autoSnapshot()) {
        return;
      }
      this.scheduleAutoSnapshot();
    });
    effect(() => {
      this.designerReady();
      const designerRef = this.designerRef;
      if (!designerRef) {
        return;
      }
      designerRef.setInput('schema', this.workspace.schema());
      designerRef.setInput('locale', this.workspace.locale());
      designerRef.setInput('designerConfig', {
        title: this.copy().workspaceTitle,
        allowDeleteRoot: false,
      });
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.mountDesigner();
  }

  protected setAutoSnapshot(value: boolean): void {
    this.autoSnapshot.set(Boolean(value));
    this.workspace.lastCommand.set(`auto snapshot: ${value ? 'on' : 'off'}`);
  }

  protected async saveSnapshot(): Promise<void> {
    await this.workspace.saveSnapshotPoint('manual');
    await this.refreshSnapshots();
  }

  protected async refreshSnapshots(): Promise<void> {
    this.snapshots.set(await this.workspace.listSnapshotPoints());
  }

  protected async restoreSnapshot(id: string): Promise<void> {
    try {
      await this.workspace.restoreSnapshotPoint(id);
      await this.refreshSnapshots();
    } catch (error) {
      this.workspace.lastCommand.set((error as Error).message);
    }
  }

  protected async removeSnapshot(id: string): Promise<void> {
    await this.workspace.deleteSnapshotPoint(id);
    await this.refreshSnapshots();
  }

  protected exportSnapshot(): void {
    const text = this.workspace.exportCurrentSnapshotJson('exported');
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dsl-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.workspace.lastCommand.set('dsl exported');
  }

  protected async onImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      await this.workspace.importSnapshotJsonAndRestore(text);
      await this.refreshSnapshots();
    } catch (error) {
      this.workspace.lastCommand.set((error as Error).message);
    } finally {
      input.value = '';
    }
  }

  protected async reloadDesigner(): Promise<void> {
    this.designerRef?.destroy();
    this.designerRef = null;
    this.designerReady.set(false);
    this.designerStatus.set('loading');
    await this.mountDesigner();
  }

  private async mountDesigner(): Promise<void> {
    try {
      const { NgxLowcodeDesignerComponent } = await import('@zhongmiao/ngx-lowcode-designer');
      const host = this.designerHost();
      host.clear();
      const componentRef = host.createComponent(NgxLowcodeDesignerComponent, {
        environmentInjector: this.environmentInjector,
      });
      this.designerRef = componentRef;
      componentRef.instance.schemaChange.subscribe((schema) => this.workspace.schema.set(schema));
      componentRef.instance.save.subscribe((schema) => void this.handleDesignerSave(schema));
      componentRef.instance.previewRequest.subscribe((schema) =>
        this.handleDesignerPreview(schema),
      );
      componentRef.instance.publishRequest.subscribe((schema) =>
        this.handleDesignerPublish(schema),
      );
      this.designerReady.set(true);
      this.designerStatus.set('ready');
    } catch (error) {
      this.workspace.lastCommand.set((error as Error).message);
      this.designerStatus.set('error');
      console.error(error);
    }
  }

  private scheduleAutoSnapshot(): void {
    if (this.autoSnapshotTimer) {
      clearTimeout(this.autoSnapshotTimer);
    }
    this.autoSnapshotTimer = setTimeout(async () => {
      await this.workspace.saveSnapshotPoint('auto');
      await this.refreshSnapshots();
    }, 1500);
  }

  protected async handleDesignerSave(
    schema: Parameters<DemoWorkspaceService['saveDesignerSnapshot']>[0],
  ): Promise<void> {
    try {
      await this.workspace.saveDesignerSnapshot(schema);
      await this.refreshSnapshots();
    } catch (error) {
      this.workspace.lastCommand.set((error as Error).message);
    }
  }

  protected handleDesignerPreview(
    schema: Parameters<DemoWorkspaceService['recordDesignerPreviewIntent']>[0],
  ): void {
    this.workspace.recordDesignerPreviewIntent(schema);
    void this.router.navigateByUrl('/studio/page/preview');
  }

  protected handleDesignerPublish(
    schema: Parameters<DemoWorkspaceService['recordDesignerPublishDraft']>[0],
  ): void {
    this.workspace.recordDesignerPublishDraft(schema);
  }

  ngOnDestroy(): void {
    if (this.autoSnapshotTimer) {
      clearTimeout(this.autoSnapshotTimer);
      this.autoSnapshotTimer = null;
    }
    this.designerRef?.destroy();
    this.designerRef = null;
  }
}
