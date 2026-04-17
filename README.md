# meta-weave

`meta-weave` is the standalone Angular platform application migrated from `ngx-lowcode/src`.
This repository is now the primary front-end entry for low-code demo/studio and deployment.

## Stack

- Angular 21
- `ngx-tethys` UI
- `@zhongmiao/ngx-lowcode-*` libraries
- `@zhongmiao/meta-lc-runtime-angular` transport adapter

## Development

```bash
npm install
npm start
```

Default URL: `http://localhost:4200`

## BFF Endpoint

- default: `http://localhost:6000`
- runtime override before app bootstrap:

```ts
window.__LC_BFF_URL__ = 'http://<host>:6000';
```

## Validation

```bash
npm run build
npm test
```

## Notes

- This app keeps the same studio routing and behavior that used to live in `ngx-lowcode/src`.
- `ngx-lowcode` now focuses on publishable library packages only.
