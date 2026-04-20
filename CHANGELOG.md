## [Unreleased]

- feat(runtime): wire the demo host to the runtime Socket.IO WebSocketManager and add a platform page topic subscription datasource for preview/runtime pages.
- fix(local-dev): derive the local BFF base URL from the current browser host, switch the default local BFF port to `6001`, and limit the demo `orders` query fields to columns that exist in the current BFF schema.
