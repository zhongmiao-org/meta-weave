import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyCardModule } from 'ngx-tethys/card';
import type { PermissionApiConfig } from '../../../core/interfaces/workspace.interfaces';
import type { PermissionScope } from '../../../core/types/workspace.types';
import { DemoWorkspaceService } from '../../../core/services/workspace.service';

@Component({
  selector: 'app-permission-page',
  imports: [ReactiveFormsModule, ThyCardModule, ThyButtonModule],
  templateUrl: './permission-page.component.html',
  styleUrl: './permission-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly workspace = inject(DemoWorkspaceService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
  protected readonly form = this.formBuilder.nonNullable.group({
    queryEndpoint: '/query',
    mutationEndpoint: '/mutation',
    tenantIdStateKey: 'tenantId',
    userIdStateKey: 'userId',
    rolesStateKey: 'roles',
    selectedRecordIdStateKey: 'selectedOrderId',
    orgIdStateKeysText: '',
    rolesText: '',
    permissionScope: 'DEPT' as PermissionScope,
    selectedOrgId: '',
    customOrgIdsText: '',
  });

  constructor() {
    effect(() => {
      const config = this.workspace.permissionApiConfig();
      this.patchForm(config);
    });
  }

  protected resetDraft(): void {
    this.patchForm(this.workspace.permissionApiConfig());
  }

  protected saveDraft(): void {
    const value = this.form.getRawValue();
    this.workspace.updatePermissionApiConfig({
      queryEndpoint: value.queryEndpoint.trim() || '/query',
      mutationEndpoint: value.mutationEndpoint.trim() || '/mutation',
      selectedOrgId: value.selectedOrgId.trim(),
      permissionScope: this.toScope(value.permissionScope),
      roles: this.parseTextList(value.rolesText),
      customOrgIds: this.parseTextList(value.customOrgIdsText),
      orgIdStateKeys: this.parseTextList(value.orgIdStateKeysText),
      stateKeys: {
        tenantId: value.tenantIdStateKey.trim() || 'tenantId',
        userId: value.userIdStateKey.trim() || 'userId',
        roles: value.rolesStateKey.trim() || 'roles',
        selectedRecordId: value.selectedRecordIdStateKey.trim() || 'selectedOrderId',
      },
    });
  }

  private patchForm(config: PermissionApiConfig): void {
    this.form.patchValue(
      {
        queryEndpoint: config.queryEndpoint,
        mutationEndpoint: config.mutationEndpoint,
        tenantIdStateKey: config.stateKeys.tenantId,
        userIdStateKey: config.stateKeys.userId,
        rolesStateKey: config.stateKeys.roles,
        selectedRecordIdStateKey: config.stateKeys.selectedRecordId,
        orgIdStateKeysText: config.orgIdStateKeys.join(', '),
        rolesText: config.roles.join(', '),
        permissionScope: config.permissionScope,
        selectedOrgId: config.selectedOrgId,
        customOrgIdsText: config.customOrgIds.join(', '),
      },
      { emitEvent: false },
    );
  }

  private parseTextList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private toScope(value: string): PermissionScope {
    if (
      value === 'SELF' ||
      value === 'DEPT' ||
      value === 'DEPT_AND_CHILDREN' ||
      value === 'CUSTOM_ORG_SET' ||
      value === 'TENANT_ALL'
    ) {
      return value;
    }
    return 'DEPT';
  }
}
