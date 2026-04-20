import {
  createDemoDatasourceDrafts,
  createDemoGeneratedSchema,
  createDemoMetaModelPreset,
  createDemoRuntimePageTopic,
} from './project-schema';

describe('project schema runtime websocket wiring', () => {
  it('adds a runtime websocket datasource with a platform page topic', () => {
    const ordersDraft = createDemoDatasourceDrafts(createDemoMetaModelPreset()).find(
      (draft) => draft.tableId === 'orders',
    );

    expect(ordersDraft).toBeDefined();
    const schema = createDemoGeneratedSchema(ordersDraft!, 'tenant-a', 'crud');
    const websocketDatasource = schema.datasources.find(
      (datasource) => datasource.command?.transport === 'websocket',
    );

    expect(websocketDatasource?.id).toBe('runtime-page-updates');
    expect(websocketDatasource?.command?.target).toBe(
      'tenant.tenant-a.page.orders-crud-demo.instance.orders-crud-demo-preview',
    );
    expect(websocketDatasource?.command?.target).toMatch(
      /^tenant\.[^.]+\.page\.[^.]+\.instance\.[^.]+$/,
    );
  });

  it('builds stable demo runtime page topics', () => {
    expect(createDemoRuntimePageTopic('tenant-b', 'customers-query-demo')).toBe(
      'tenant.tenant-b.page.customers-query-demo.instance.customers-query-demo-preview',
    );
    expect(createDemoRuntimePageTopic('tenant-b', 'customers-query-demo', 'instance-42')).toBe(
      'tenant.tenant-b.page.customers-query-demo.instance.instance-42',
    );
  });
});
