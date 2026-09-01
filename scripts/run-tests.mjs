// Hermetic test runner: points SqliteStore at a throwaway data dir so tests
// neither read stale state nor pollute the user's real %APPDATA% store.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const dataDir = mkdtempSync(path.join(tmpdir(), 'openworker-tests-'));

try {
  const result = spawnSync('node', ['--test', 'dist/tests/*.test.js'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, OPENWORKER_DATA_DIR: dataDir },
  });
  process.exitCode = result.status ?? 1;
} finally {
  try {
    rmSync(dataDir, { recursive: true, force: true });
  } catch (e) {
    // best-effort cleanup
  }
}
