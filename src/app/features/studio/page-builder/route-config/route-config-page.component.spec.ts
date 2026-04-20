import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createOrdersDemoSchema } from '../../../../core/models/project-schema';
import { DemoWorkspaceService } from '../../../../core/services/workspace.service';
import { RouteConfigPageComponent } from './route-config-page.component';

describe('RouteConfigPageComponent designer publish draft surface', () => {
  function createFixture(publishDraft: ReturnType<typeof signal<unknown>>) {
    TestBed.configureTestingModule({
      imports: [RouteConfigPageComponent],
      providers: [
        {
          provide: DemoWorkspaceService,
          useValue: {
            locale: signal('en-US'),
            previewRoutePath: computed(() => '/preview/orders-crud-demo'),
            routeMenuTitle: computed(() => 'commerce-core:Orders CRUD'),
            previewRouteConfig: computed(() =>
              JSON.stringify(
                {
                  path: '/preview/orders-crud-demo',
                  component: 'LowcodePagePreviewComponent',
                },
                null,
                2,
              ),
            ),
            designerPublishDraft: publishDraft,
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(RouteConfigPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows an empty state before a designer publish draft exists', () => {
    const fixture = createFixture(signal(null));

    expect(textContent(fixture)).toContain('No designer publish draft yet.');
  });

  it('shows the latest designer publish draft metadata', () => {
    const fixture = createFixture(
      signal({
        pageId: 'orders-crud-demo',
        status: 'drafted',
        schemaFingerprint: 'fnv1a-publish',
        requestedAt: '2026-04-20T09:12:00.000Z',
        schema: createOrdersDemoSchema('tenant-a'),
      }),
    );

    const text = textContent(fixture);
    expect(text).toContain('orders-crud-demo');
    expect(text).toContain('drafted');
    expect(text).toContain('fnv1a-publish');
    expect(text).toContain('2026-04-20T09:12:00.000Z');
  });
});

function textContent(fixture: ComponentFixture<unknown>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}
