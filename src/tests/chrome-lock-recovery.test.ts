import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import os from "os";
import { ChromeLockRecovery } from "../utils/chrome-lock-recovery.js";

test("ChromeLockRecovery - isProfileLocked and recoverProfileLock", async (t) => {
  const recovery = new ChromeLockRecovery();

  // Create a dummy profile dir
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-lock-test-"));

  await t.test("should return false if directory does not exist", () => {
    assert.strictEqual(recovery.isProfileLocked(path.join(tmpDir, "non-existent")), false);
  });

  await t.test("should return false if lockfile does not exist", () => {
    assert.strictEqual(recovery.isProfileLocked(tmpDir), false);
  });

  await t.test("should detect lockfile and successfully recover if not locked by Win32 mutex", () => {
    const lockPath = path.join(tmpDir, "SingletonLock");
    fs.writeFileSync(lockPath, "dummy lock data");

    // Should detect it as locked initially because file exists
    assert.strictEqual(recovery.isProfileLocked(tmpDir), true);

    // Try recovering
    const recovered = recovery.recoverProfileLock(tmpDir);
    assert.strictEqual(recovered, true, "Should be able to recover when file is not locked");

    // After recovery, file should be gone
    assert.strictEqual(fs.existsSync(lockPath), false);

    // Now it should no longer be locked
    assert.strictEqual(recovery.isProfileLocked(tmpDir), false);
  });

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
