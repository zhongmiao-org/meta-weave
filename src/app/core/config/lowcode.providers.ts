import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  defaultActionManager,
  NGX_LOWCODE_ACTION_MANAGER,
  NGX_LOWCODE_CONFIG,
  NGX_LOWCODE_DATASOURCE_MANAGER,
  NGX_LOWCODE_WEBSOCKET_MANAGER,
  NgxLowcodeDataSourceManager,
} from '@zhongmiao/ngx-lowcode-core';
import {
  createBffDataSourceManager,
  createDefaultWebSocketManager,
} from '@zhongmiao/meta-lc-runtime-angular';
import { provideNgxLowcodeMaterials } from '@zhongmiao/ngx-lowcode-materials';
import { DemoRuntimeExecutionStatusService } from '../services/runtime-execution-status.service';

function resolveBffBaseUrl(): string {
  const globalUrl = (globalThis as { __LC_BFF_URL__?: unknown }).__LC_BFF_URL__;
  const normalized = typeof globalUrl === 'string' ? globalUrl.trim() : '';
  return normalized.length > 0 ? normalized.replace(/\/+$/, '') : 'http://localhost:6000';
}

export function provideLowcodeRuntime(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NGX_LOWCODE_ACTION_MANAGER,
      useValue: defaultActionManager(),
    },
    {
      provide: NGX_LOWCODE_DATASOURCE_MANAGER,
      useFactory: (status: DemoRuntimeExecutionStatusService): NgxLowcodeDataSourceManager => {
        const manager = createBffDataSourceManager({
          baseUrl: resolveBffBaseUrl(),
          onExecution: (snapshot) => status.recordTransport(snapshot),
        });
        return {
          execute: async (request) => {
            status.recordRequestContext(request.state);
            const result = await manager.execute(request);
            status.recordResult(result);
            return result;
          },
        };
      },
      deps: [DemoRuntimeExecutionStatusService],
    },
    {
      provide: NGX_LOWCODE_WEBSOCKET_MANAGER,
      useValue: createDefaultWebSocketManager(),
    },
    {
      provide: NGX_LOWCODE_CONFIG,
      useFactory: (
        actionManager: ReturnType<typeof defaultActionManager>,
        dataSourceManager: NgxLowcodeDataSourceManager,
        webSocketManager: ReturnType<typeof createDefaultWebSocketManager>,
      ) => ({
        actionManager,
        dataSourceManager,
        webSocketManager,
      }),
      deps: [
        NGX_LOWCODE_ACTION_MANAGER,
        NGX_LOWCODE_DATASOURCE_MANAGER,
        NGX_LOWCODE_WEBSOCKET_MANAGER,
      ],
    },
    provideNgxLowcodeMaterials(),
  ]);
}
