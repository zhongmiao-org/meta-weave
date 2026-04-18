export type PermissionScope =
  | 'SELF'
  | 'DEPT'
  | 'DEPT_AND_CHILDREN'
  | 'CUSTOM_ORG_SET'
  | 'TENANT_ALL';

export type ProjectId = 'commerce-core' | 'crm-ops';

export type TenantId = 'tenant-a' | 'tenant-b';

export type StudioSection = 'model' | 'datasource' | 'permission' | 'page';
