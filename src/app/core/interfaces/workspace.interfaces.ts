import type { NgxLowcodeDatasourceDraft } from '@zhongmiao/ngx-lowcode-datasource';
import type {
  NgxLowcodeMetaModelDraft,
  NgxLowcodeMetaModelValidationIssue,
} from '@zhongmiao/ngx-lowcode-meta-model';
import type { NgxLowcodePageSchema } from '@zhongmiao/ngx-lowcode-core-types';
import type { PermissionScope } from '../types/workspace.types';

export interface PermissionApiConfig {
  queryEndpoint: string;
  mutationEndpoint: string;
  roles: string[];
  selectedOrgId: string;
  permissionScope: PermissionScope;
  customOrgIds: string[];
  stateKeys: {
    tenantId: string;
    userId: string;
    roles: string;
    selectedRecordId: string;
  };
  orgIdStateKeys: string[];
}

export interface DslSnapshotMetadataV1 {
  version: 'demo-dsl-snapshot-v1';
  timestamp: string;
  checksum: string;
  label: string;
}

export interface DslSnapshotV1 {
  metadata: DslSnapshotMetadataV1;
  metaModel: NgxLowcodeMetaModelDraft;
  datasourceDrafts: NgxLowcodeDatasourceDraft[];
  schema: NgxLowcodePageSchema;
}

export interface DslSnapshotRecord {
  id: string;
  version: 'demo-dsl-snapshot-v1';
  timestamp: string;
  checksum: string;
  label: string;
  payload: unknown;
}

export interface DesignerPreviewIntent {
  pageId: string;
  routePath: string;
  schemaFingerprint: string;
  requestedAt: string;
  schema: NgxLowcodePageSchema;
}

export interface DesignerPublishDraft {
  pageId: string;
  schemaFingerprint: string;
  status: 'drafted';
  requestedAt: string;
  schema: NgxLowcodePageSchema;
}

export interface QueryExecutionSnapshot {
  requestId: string;
  source: 'bff' | 'fallback';
  status: 'success' | 'fallback' | 'error' | 'denied';
  tenantId: string;
  rowCount: number;
  message: string;
  happenedAt: string;
}

export interface WorkspaceValidationState {
  issues: readonly NgxLowcodeMetaModelValidationIssue[];
}
