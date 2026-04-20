import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createOrdersDemoSchema } from '../../../../core/models/project-schema';
import { DemoRuntimeExecutionStatusService } from '../../../../core/services/runtime-execution-status.service';
import { DemoWorkspaceService } from '../../../../core/services/workspace.service';
import { PagePreviewComponent } from './page-preview.component';

describe('PagePreviewComponent designer preview intent surface', () => {
  function createFixture(previewIntent: ReturnType<typeof signal<unknown>>) {
    const schema = signal(createOrdersDemoSchema('tenant-a'));
    TestBed.configureTestingModule({
      imports: [PagePreviewComponent],
      providers: [
        {
          provide: DemoWorkspaceService,
          useValue: {
            locale: signal('en-US'),
            schema,
            designerPreviewIntent: previewIntent,
          },
        },
        {
          provide: DemoRuntimeExecutionStatusService,
          useValue: {
            lastExecution: signal({
              requestId: 'req-1',
              source: 'bff',
              status: 'success',
              tenantId: 'tenant-a',
              rowCount: 2,
              message: 'ready',
              happenedAt: '2026-04-20T09:00:00.000Z',
            }),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(PagePreviewComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows an empty state before a designer preview request exists', () => {
    const fixture = createFixture(signal(null));

    expect(textContent(fixture)).toContain('No designer preview request yet.');
  });

  it('shows the latest designer preview intent metadata', () => {
    const fixture = createFixture(
      signal({
        pageId: 'orders-crud-demo',
        routePath: '/preview/orders-crud-demo',
        schemaFingerprint: 'fnv1a-preview',
        requestedAt: '2026-04-20T09:10:00.000Z',
        schema: createOrdersDemoSchema('tenant-a'),
      }),
    );

    const text = textContent(fixture);
    expect(text).toContain('orders-crud-demo');
    expect(text).toContain('/preview/orders-crud-demo');
    expect(text).toContain('fnv1a-preview');
    expect(text).toContain('2026-04-20T09:10:00.000Z');
  });
});

function textContent(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
