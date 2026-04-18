import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import type { NgxLowcodeMetaColumnType } from '@zhongmiao/ngx-lowcode-meta-model';
import { getDemoProjectI18n } from '@zhongmiao/ngx-lowcode-i18n';
import { ThyButtonModule } from 'ngx-tethys/button';
import { ThyCardModule } from 'ngx-tethys/card';
import { ThyEmptyModule } from 'ngx-tethys/empty';
import { ThyResultModule } from 'ngx-tethys/result';
import { ThyTagModule } from 'ngx-tethys/tag';
import { DemoWorkspaceService } from '../../../core/services/workspace.service';

@Component({
  selector: 'app-model-page',
  imports: [ThyCardModule, ThyButtonModule, ThyTagModule, ThyEmptyModule, ThyResultModule],
  templateUrl: './model-page.component.html',
  styleUrl: './model-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelPageComponent {
  protected readonly workspace = inject(DemoWorkspaceService);
  protected readonly copy = computed(() => getDemoProjectI18n(this.workspace.locale()));
  protected readonly tableIds = computed(() =>
    this.workspace.metaModel().tables.map((table) => table.id),
  );
  protected readonly columnTypes: readonly NgxLowcodeMetaColumnType[] = [
    'string',
    'text',
    'number',
    'boolean',
    'date',
    'datetime',
    'json',
  ];

  protected toColumnType(value: string): NgxLowcodeMetaColumnType {
    return this.columnTypes.includes(value as NgxLowcodeMetaColumnType)
      ? (value as NgxLowcodeMetaColumnType)
      : 'string';
  }

  protected addRelationRow(): void {
    const tableIds = this.tableIds();
    const fromTableId = tableIds[0] ?? '';
    const toTableId = tableIds[1] ?? tableIds[0] ?? '';
    const fromColumnId = this.columnsForTable(fromTableId)[0] ?? '';
    const toColumnId = this.columnsForTable(toTableId)[0] ?? '';
    this.workspace.addRelation(fromTableId, fromColumnId, toTableId, toColumnId);
  }

  protected columnsForTable(tableId: string): string[] {
    return (
      this.workspace
        .metaModel()
        .tables.find((table) => table.id === tableId)
        ?.columns.map((column) => column.id) ?? []
    );
  }

  protected onRelationFromTableChange(relationId: string, tableId: string): void {
    const defaultColumnId = this.columnsForTable(tableId)[0] ?? '';
    this.workspace.updateRelation(relationId, {
      fromTableId: tableId,
      fromColumnId: defaultColumnId,
    });
  }

  protected onRelationToTableChange(relationId: string, tableId: string): void {
    const defaultColumnId = this.columnsForTable(tableId)[0] ?? '';
    this.workspace.updateRelation(relationId, { toTableId: tableId, toColumnId: defaultColumnId });
  }

  protected toRelationKind(value: string): 'many-to-one' | 'one-to-many' {
    return value === 'one-to-many' ? 'one-to-many' : 'many-to-one';
  }
}
