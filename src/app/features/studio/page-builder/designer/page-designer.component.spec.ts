import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import type { NgxLowcodePageSchema } from '@zhongmiao/ngx-lowcode-core-types';
import { createOrdersDemoSchema } from '../../../../core/models/project-schema';
import { DemoWorkspaceService } from '../../../../core/services/workspace.service';
import { PageDesignerComponent } from './page-designer.component';

describe('PageDesignerComponent designer command bridge', () => {
  function createComponentWithWorkspace() {
    const schema = signal(createOrdersDemoSchema('tenant-a'));
    const lastCommand = signal('workspace ready');
    const workspace = {
      locale: signal('zh-CN'),
      schema,
      snapshotFingerprint: signal('snapshot-1'),
      lastCommand,
      saveDesignerSnapshot: vi.fn().mockResolvedValue({ id: 'snapshot-1', label: 'designer-save' }),
      listSnapshotPoints: vi.fn().mockResolvedValue([]),
      recordDesignerPreviewIntent: vi.fn(),
      recordDesignerPublishDraft: vi.fn(),
    };
    const router = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DemoWorkspaceService, useValue: workspace },
        { provide: Router, useValue: router },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new PageDesignerComponent());
    return {
      component,
      workspace,
      router,
      schema: createOrdersDemoSchema('tenant-b'),
    };
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('saves designer save events as snapshots and refreshes the snapshot list', async () => {
    const { component, workspace, schema } = createComponentWithWorkspace();

    await (
      component as unknown as {
        handleDesignerSave: (schema: NgxLowcodePageSchema) => Promise<void>;
      }
    ).handleDesignerSave(schema);

    expect(workspace.saveDesignerSnapshot).toHaveBeenCalledTimes(1);
    expect(workspace.saveDesignerSnapshot).toHaveBeenCalledWith(schema);
    expect(workspace.listSnapshotPoints).toHaveBeenCalled();
    component.ngOnDestroy();
  });

  it('forwards designer preview events into workspace preview intent state and navigates to preview', () => {
    const { component, workspace, router, schema } = createComponentWithWorkspace();

    (
      component as unknown as {
        handleDesignerPreview: (schema: NgxLowcodePageSchema) => void;
      }
    ).handleDesignerPreview(schema);

    expect(workspace.recordDesignerPreviewIntent).toHaveBeenCalledTimes(1);
    expect(workspace.recordDesignerPreviewIntent).toHaveBeenCalledWith(schema);
    expect(router.navigateByUrl).toHaveBeenCalledOnce();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/studio/page/preview');
    component.ngOnDestroy();
  });

  it('forwards designer publish events into workspace publish draft state', () => {
    const { component, workspace, schema } = createComponentWithWorkspace();

    (
      component as unknown as {
        handleDesignerPublish: (schema: NgxLowcodePageSchema) => void;
      }
    ).handleDesignerPublish(schema);

    expect(workspace.recordDesignerPublishDraft).toHaveBeenCalledTimes(1);
    expect(workspace.recordDesignerPublishDraft).toHaveBeenCalledWith(schema);
    component.ngOnDestroy();
  });
});
