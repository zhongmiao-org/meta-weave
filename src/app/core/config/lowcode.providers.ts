import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  defaultActionManager,
  NGX_LOWCODE_ACTION_MANAGER,
  NGX_LOWCODE_CONFIG,
  NGX_LOWCODE_DATASOURCE_MANAGER,
  NGX_LOWCODE_WEBSOCKET_MANAGER,
  NgxLowcodeDataSourceManager,
  NgxLowcodeWebSocketManager,
} from '@zhongmiao/ngx-lowcode-core';
import {
  createBffDataSourceManager,
  createDefaultWebSocketManager,
} from '@zhongmiao/meta-lc-runtime-angular';
import { provideNgxLowcodeMaterials } from '@zhongmiao/ngx-lowcode-materials';
import { DemoRuntimeExecutionStatusService } from '../services/runtime-execution-status.service';
import { resolveRuntimeBffBaseUrl } from './bff-url';

export const RUNTIME_WEBSOCKET_NAMESPACE = '/runtime';

interface RuntimeWebSocketFactoryModule {
  createSocketIoWebSocketManager?: (options: {
    baseUrl: string;
    namespace: string;
  }) => NgxLowcodeWebSocketManager;
}

interface RuntimeWebSocketManagerOptions {
  baseUrl?: string;
  namespace?: string;
  moduleLoader?: () => Promise<RuntimeWebSocketFactoryModule>;
}

interface RuntimeWebSocketSubscribeOptions {
  afterReplayId?: string;
}

function resolveBffBaseUrl(): string {
  return resolveRuntimeBffBaseUrl();
}

export function createRuntimeWebSocketManager(
  options: RuntimeWebSocketManagerOptions = {},
): NgxLowcodeWebSocketManager {
  const baseUrl = options.baseUrl ?? resolveBffBaseUrl();
  const namespace = options.namespace ?? RUNTIME_WEBSOCKET_NAMESPACE;
  const moduleLoader =
    options.moduleLoader ??
    (() => import('@zhongmiao/meta-lc-runtime-angular') as Promise<RuntimeWebSocketFactoryModule>);
  let delegate: Promise<NgxLowcodeWebSocketManager> | null = null;

  const getDelegate = (): Promise<NgxLowcodeWebSocketManager> => {
    delegate ??= moduleLoader().then((module) => {
      if (typeof module.createSocketIoWebSocketManager === 'function') {
        return module.createSocketIoWebSocketManager({ baseUrl, namespace });
      }

      console.warn(
        '[meta-weave] Socket.IO WebSocketManager is unavailable; falling back to the default no-op manager until the local link or published package is available.',
      );
      return createDefaultWebSocketManager();
    });
    return delegate;
  };

  return {
    connect: async () => {
      await (await getDelegate()).connect();
    },
    subscribe: async (
      channel: Parameters<NgxLowcodeWebSocketManager['subscribe']>[0],
      handler: Parameters<NgxLowcodeWebSocketManager['subscribe']>[1],
      subscribeOptions?: RuntimeWebSocketSubscribeOptions,
    ) => {
      const delegate = await getDelegate();
      await (
        delegate.subscribe as (
          channel: string,
          handler: Parameters<NgxLowcodeWebSocketManager['subscribe']>[1],
          subscribeOptions?: RuntimeWebSocketSubscribeOptions,
        ) => void | Promise<void>
      )(channel, handler, subscribeOptions);
    },
    unsubscribe: async (
      channel: Parameters<NgxLowcodeWebSocketManager['unsubscribe']>[0],
      handler: Parameters<NgxLowcodeWebSocketManager['unsubscribe']>[1],
    ) => {
      await (await getDelegate()).unsubscribe(channel, handler);
    },
    disconnect: async () => {
      await (await getDelegate()).disconnect();
    },
  } satisfies NgxLowcodeWebSocketManager;
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
          execute: async (request: Parameters<NgxLowcodeDataSourceManager['execute']>[0]) => {
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
      useFactory: (): NgxLowcodeWebSocketManager => createRuntimeWebSocketManager(),
    },
    {
      provide: NGX_LOWCODE_CONFIG,
      useFactory: (
        actionManager: ReturnType<typeof defaultActionManager>,
        dataSourceManager: NgxLowcodeDataSourceManager,
        webSocketManager: NgxLowcodeWebSocketManager,
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
