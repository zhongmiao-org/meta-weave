import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const designerBundlePath = resolve(
  process.cwd(),
  'node_modules/@zhongmiao/ngx-lowcode-designer/fesm2022/zhongmiao-ngx-lowcode-designer.mjs',
);

if (!existsSync(designerBundlePath)) {
  console.warn('[patch-ngx-lowcode-designer] bundle not found, skipping');
  process.exit(0);
}

const source = readFileSync(designerBundlePath, 'utf8');
const next = source.replace(
  /@font-face\{font-family:tabler-icons[\s\S]*?(?=:host\{display:block)/g,
  '',
);

if (source === next) {
  console.log('[patch-ngx-lowcode-designer] no inline tabler font block found');
  process.exit(0);
}

writeFileSync(designerBundlePath, next);
console.log('[patch-ngx-lowcode-designer] removed inline tabler font bundle');
