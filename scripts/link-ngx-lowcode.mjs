import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, '..');
const ngxLowcodeRoot = resolve(workspaceRoot, '..', 'ngx-lowcode');
const shouldBuild = !process.argv.includes('--no-build');

const packageDirs = [
  'ngx-lowcode',
  'ngx-lowcode-core',
  'ngx-lowcode-core-types',
  'ngx-lowcode-core-utils',
  'ngx-lowcode-datasource',
  'ngx-lowcode-designer',
  'ngx-lowcode-i18n',
  'ngx-lowcode-materials',
  'ngx-lowcode-meta-model',
  'ngx-lowcode-puzzle-adapter',
  'ngx-lowcode-renderer',
  'ngx-lowcode-testing',
];
const requiredPeerPackages = ['date-fns@4.1.0', '@date-fns/tz@1.2.0'];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function assertFile(path, message) {
  if (!existsSync(path)) {
    console.error(`[link-ngx-lowcode] ${message}`);
    console.error(`[link-ngx-lowcode] Missing: ${path}`);
    process.exit(1);
  }
}

assertFile(
  resolve(ngxLowcodeRoot, 'package.json'),
  'Expected ngx-lowcode to be a sibling directory of meta-weave.',
);

if (shouldBuild) {
  console.log('[link-ngx-lowcode] Building ngx-lowcode libraries...');
  run('npm', ['run', 'build:libs', '--prefix', ngxLowcodeRoot]);
} else {
  console.log('[link-ngx-lowcode] Skipping ngx-lowcode build.');
}

const aggregateSource = resolve(ngxLowcodeRoot, 'projects', 'ngx-lowcode');
const aggregateDist = resolve(ngxLowcodeRoot, 'dist', 'ngx-lowcode');
assertFile(
  resolve(aggregateSource, 'package.json'),
  'Expected aggregate ngx-lowcode package metadata.',
);
assertFile(resolve(aggregateSource, 'index.d.ts'), 'Expected aggregate ngx-lowcode type entry.');
mkdirSync(aggregateDist, { recursive: true });
copyFileSync(resolve(aggregateSource, 'package.json'), resolve(aggregateDist, 'package.json'));
copyFileSync(resolve(aggregateSource, 'index.d.ts'), resolve(aggregateDist, 'index.d.ts'));
writeFileSync(resolve(aggregateDist, 'index.js'), 'export {};\n');

const packagePaths = packageDirs.map((packageDir) => {
  const distPath = resolve(ngxLowcodeRoot, 'dist', packageDir);
  assertFile(
    resolve(distPath, 'package.json'),
    `Expected built package for ${packageDir}. Run npm run link:ngx-lowcode without --no-build first.`,
  );
  return relative(workspaceRoot, distPath);
});

console.log('[link-ngx-lowcode] Installing local ngx-lowcode dist packages...');
run('npm', ['install', '--no-save', '--package-lock=false', ...requiredPeerPackages]);

const scopeDir = resolve(workspaceRoot, 'node_modules', '@zhongmiao');
mkdirSync(scopeDir, { recursive: true });

for (const distPath of packagePaths.map((packagePath) => resolve(workspaceRoot, packagePath))) {
  const packageJson = JSON.parse(readFileSync(resolve(distPath, 'package.json'), 'utf8'));
  const packageName = String(packageJson.name ?? '');
  const [, packageBasename] = packageName.split('/');
  if (!packageName.startsWith('@zhongmiao/') || !packageBasename) {
    console.error(`[link-ngx-lowcode] Unexpected package name in ${distPath}: ${packageName}`);
    process.exit(1);
  }
  const targetPath = resolve(scopeDir, packageBasename);
  rmSync(targetPath, { recursive: true, force: true });
  symlinkSync(distPath, targetPath, 'dir');
  console.log(`[link-ngx-lowcode] Linked ${packageName} -> ${distPath}`);
}

console.log('[link-ngx-lowcode] Applying local designer bundle patch...');
run('node', [resolve(workspaceRoot, 'scripts', 'patch-ngx-lowcode-designer.mjs')]);

console.log('[link-ngx-lowcode] Linked local ngx-lowcode packages.');
