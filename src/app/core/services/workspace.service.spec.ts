import { TestBed } from '@angular/core/testing';
import { DemoWorkspaceService } from './workspace.service';

describe('DemoWorkspaceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
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
});
