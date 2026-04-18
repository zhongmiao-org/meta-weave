import { execFileSync } from 'node:child_process';

const [baseSha, headSha] = process.argv.slice(2);
if (!baseSha || !headSha) {
  console.error('Usage: check-changelog-gate.mjs <base-sha> <head-sha>');
  process.exit(1);
}

const changedFiles = execFileSync('git', ['diff', '--name-only', baseSha, headSha], {
  encoding: 'utf8',
})
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (changedFiles.length === 0) {
  console.log('No changed files detected.');
  process.exit(0);
}

const changedSet = new Set(changedFiles);
const changelogFile = 'CHANGELOG.md';

const requiresChangelog = changedFiles.some((file) => {
  if (file === changelogFile) {
    return false;
  }
  if (file.startsWith('.github/')) {
    return false;
  }
  if (file.startsWith('docs/')) {
    return false;
  }
  if (file.endsWith('.md')) {
    return false;
  }
  return true;
});

if (requiresChangelog && !changedSet.has(changelogFile)) {
  console.error('Missing required changelog updates:');
  console.error(`- ${changelogFile}`);
  process.exit(1);
}

console.log('Changelog gate passed.');
