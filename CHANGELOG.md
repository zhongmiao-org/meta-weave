## [Unreleased]

- chore(deps): upgrade the demo host to the published ngx-lowcode 0.2.0 and runtime-angular 0.2.1 packages.
- feat(designer): expose preview intent and publish draft metadata as visible Designer V1 acceptance surfaces.
- feat(designer): bridge Designer save, preview, and publish events into demo snapshot and command state.
- feat(runtime): wire the demo host to the runtime Socket.IO WebSocketManager and add a platform page topic subscription datasource for preview/runtime pages.
- fix(local-dev): derive the local BFF base URL from the current browser host, switch the default local BFF port to `6001`, and limit the demo `orders` query fields to columns that exist in the current BFF schema.
