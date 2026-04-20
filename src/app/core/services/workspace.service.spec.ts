import { TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import type { DslSnapshotRecord } from '../interfaces/workspace.interfaces';
import { createOrdersDemoSchema } from '../models/project-schema';
import { DemoSnapshotStoreService } from './snapshot-store.service';
import { DemoWorkspaceService } from './workspace.service';

class FakeSnapshotStoreService {
  readonly records: DslSnapshotRecord[] = [];

  async saveSnapshot(record: DslSnapshotRecord): Promise<void> {
    this.records.push(structuredClone(record));
  }

  async listSnapshots(): Promise<DslSnapshotRecord[]> {
    return [...this.records].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async getSnapshot(id: string): Promise<DslSnapshotRecord | null> {
    return structuredClone(this.records.find((record) => record.id === id) ?? null);
  }

  async deleteSnapshot(id: string): Promise<void> {
    const index = this.records.findIndex((record) => record.id === id);
    if (index >= 0) {
      this.records.splice(index, 1);
    }
  }
}

describe('DemoWorkspaceService', () => {
  let snapshotStore: FakeSnapshotStoreService;

  beforeEach(() => {
    snapshotStore = new FakeSnapshotStoreService();
    TestBed.configureTestingModule({
      providers: [{ provide: DemoSnapshotStoreService, useValue: snapshotStore }],
    });
  });

  it('switches tenant and regenerates schema state', () => {
    const service = TestBed.inject(DemoWorkspaceService);

    service.switchTenant('tenant-b');

    expect(service.tenantId()).toBe('tenant-b');
    expect(service.schema().state['tenantId']).toBe('tenant-b');
    expect(service.lastCommand()).toBe('tenant switched: tenant-b');
  });

  it('resets workspace to the default preset', () => {
    const service = TestBed.inject(DemoWorkspaceService);

    service.addTable();
    service.resetWorkspace();

    expect(service.projectId()).toBe('commerce-core');
    expect(service.tenantId()).toBe('tenant-a');
    expect(service.metaModel().tables.length).toBeGreaterThan(0);
    expect(service.lastCommand()).toBe('workspace reset');
  });

  it('saves designer schema events as snapshot records', async () => {
    const service = TestBed.inject(DemoWorkspaceService);
    const schema = createOrdersDemoSchema('tenant-b');
    schema.pageMeta.id = 'designer-save-page';

    const record = await service.saveDesignerSnapshot(schema);

    expect(service.schema().pageMeta.id).toBe('designer-save-page');
    expect(record.label).toBe('designer-save');
    expect(snapshotStore.records[0]?.label).toBe('designer-save');
    expect(service.lastCommand()).toBe('snapshot saved: designer-save');
  });

  it('records designer preview intent from the emitted schema', () => {
    const service = TestBed.inject(DemoWorkspaceService);
    const schema = createOrdersDemoSchema('tenant-a');
    schema.pageMeta.id = 'designer-preview-page';

    const intent = service.recordDesignerPreviewIntent(schema);

    expect(intent.pageId).toBe('designer-preview-page');
    expect(intent.routePath).toBe('/preview/designer-preview-page');
    expect(intent.schema.pageMeta.id).toBe('designer-preview-page');
    expect(intent.schemaFingerprint).toMatch(/^fnv1a-/);
    expect(service.designerPreviewIntent()).toEqual(intent);
    expect(service.lastCommand()).toBe('preview requested: designer-preview-page');
  });

  it('records designer publish draft without calling a remote publish API', () => {
    const service = TestBed.inject(DemoWorkspaceService);
    const schema = createOrdersDemoSchema('tenant-a');
    schema.pageMeta.id = 'designer-publish-page';

    const draft = service.recordDesignerPublishDraft(schema);

    expect(draft).toEqual(
      expect.objectContaining({
        pageId: 'designer-publish-page',
        status: 'drafted',
      }),
    );
    expect(draft.schemaFingerprint).toMatch(/^fnv1a-/);
    expect(service.designerPublishDraft()).toEqual(draft);
    expect(service.lastCommand()).toBe('publish drafted: designer-publish-page');
  });
});
