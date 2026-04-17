import {
  createDemoMetaModelPreset,
  createDemoDatasourceDrafts,
  createDemoGeneratedSchema,
} from './demo-project-schema';

describe('demo-project-schema orchestration', () => {
  it('hydrates schema with stable demo state keys and datasource orchestration params', () => {
    const model = createDemoMetaModelPreset();
    const draft = createDemoDatasourceDrafts(model).find(
      (candidate) => candidate.tableId === 'orders',
    );
    expect(draft).toBeTruthy();
    if (!draft) {
      return;
    }

    const schema = createDemoGeneratedSchema(draft, 'tenant-a', 'crud');
    const queryDatasource = schema.datasources.find(
      (datasource) => datasource.id === 'orders-query-datasource',
    );
    const createDatasource = schema.datasources.find(
      (datasource) => datasource.id === 'orders-create-datasource',
    );
    const selectAction = schema.actions.find((action) => action.id === 'select-row-action');
    const clearAction = schema.actions.find((action) => action.id === 'clear-editor-action');

    expect(schema.state).toEqual(
      expect.objectContaining({
        tenantId: 'tenant-a',
        userId: 'demo-tenant-a-user',
        selectedOrderId: '',
        formMode: 'idle',
      }),
    );
    expect(schema.state['roles']).toEqual(['USER']);

    expect(queryDatasource?.request?.params).toEqual(
      expect.objectContaining({
        filterStatePrefix: 'filter_',
        stateKeys: expect.objectContaining({
          tenantId: 'tenantId',
          userId: 'userId',
          roles: 'roles',
        }),
      }),
    );

    expect(createDatasource?.request?.params).toEqual(
      expect.objectContaining({
        operation: 'create',
        stateKeys: expect.objectContaining({
          selectedRecordId: 'selectedOrderId',
        }),
        orgIdStateKeys: ['orgId', 'form_org_id', 'org_id', 'selectedOrgId'],
      }),
    );

    expect(selectAction?.steps[0]?.stateKey).toBe('selectedOrderId');
    expect(
      clearAction?.steps.some(
        (step) => step.type === 'setState' && step.patch?.['selectedOrderId'] === '',
      ),
    ).toBe(true);
  });
});
