import { createRuntimeWebSocketManager, RUNTIME_WEBSOCKET_NAMESPACE } from './lowcode.providers';

describe('createRuntimeWebSocketManager', () => {
  it('loads the Socket.IO WebSocketManager factory with BFF runtime namespace options', async () => {
    const factoryCalls: Array<{ baseUrl: string; namespace: string }> = [];
    const lifecycleCalls: string[] = [];
    const manager = createRuntimeWebSocketManager({
      baseUrl: 'http://localhost:6001',
      moduleLoader: async () => ({
        createSocketIoWebSocketManager: (options) => {
          factoryCalls.push(options);
          return {
            connect: () => {
              lifecycleCalls.push('connect');
            },
            subscribe: (channel: string) => {
              lifecycleCalls.push(`subscribe:${channel}`);
            },
            unsubscribe: (channel: string) => {
              lifecycleCalls.push(`unsubscribe:${channel}`);
            },
            disconnect: () => {
              lifecycleCalls.push('disconnect');
            },
          };
        },
      }),
    });

    await manager.connect();
    await manager.subscribe(
      'tenant.tenant-a.page.orders-crud-demo.instance.orders-crud-demo-preview',
      () => {
        // Handler body is irrelevant for provider wiring.
      },
    );
    await manager.unsubscribe(
      'tenant.tenant-a.page.orders-crud-demo.instance.orders-crud-demo-preview',
      () => {
        // Handler identity is not inspected by this fake manager.
      },
    );
    await manager.disconnect();

    expect(factoryCalls).toEqual([
      {
        baseUrl: 'http://localhost:6001',
        namespace: RUNTIME_WEBSOCKET_NAMESPACE,
      },
    ]);
    expect(lifecycleCalls).toEqual([
      'connect',
      'subscribe:tenant.tenant-a.page.orders-crud-demo.instance.orders-crud-demo-preview',
      'unsubscribe:tenant.tenant-a.page.orders-crud-demo.instance.orders-crud-demo-preview',
      'disconnect',
    ]);
  });
});
