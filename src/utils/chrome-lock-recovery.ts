import fs from 'fs';
import path from 'path';
import os from 'os';

export class ChromeLockRecovery {
  /**
   * Checks if the Chrome/Edge profile is currently locked.
   * Looks for 'SingletonLock', 'SingletonCookie', or 'lockfile' in the profile directory.
   */
  public isProfileLocked(profilePath: string): boolean {
    if (!fs.existsSync(profilePath)) {
      return false;
    }

    const lockFiles = ['SingletonLock', 'SingletonCookie', 'lockfile'];

    for (const lockFile of lockFiles) {
      const fullPath = path.join(profilePath, lockFile);
      if (fs.existsSync(fullPath)) {
        try {
          // In Win32, an active lock often prevents opening with write access.
          // Or if it's a symlink (like SingletonLock on Linux/Mac), lstat handles it.
          if (os.platform() === 'win32') {
            // Attempt to open the file in read-write mode.
            // If it throws EBUSY or EPERM, it is locked by another process.
            const fd = fs.openSync(fullPath, 'r+');
            fs.closeSync(fd);
            // If we can open it, it might be an orphaned lock file.
          } else {
            // On Unix, check if the target process is still running (advanced check),
            // but for simple detection, existence is enough for now, or check symlink target.
            const stats = fs.lstatSync(fullPath);
            if (stats.isSymbolicLink()) {
               // Usually points to hostname-PID
            }
          }
          return true; // We consider it locked if the file exists
        } catch (err: any) {
          if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
            return true; // Strictly locked by Win32 mutex/process
          }
        }
      }
    }

    return false;
  }

  /**
   * Safely attempts to recover a locked profile.
   * On Win32, it will try to gracefully remove orphaned lock files.
   * Returns true if successfully recovered/unlocked, false if still locked by active process.
   */
  public recoverProfileLock(profilePath: string): boolean {
    if (!this.isProfileLocked(profilePath)) {
      return true; // Not locked, we are good.
    }

    const lockFiles = ['SingletonLock', 'SingletonCookie', 'lockfile'];
    let recovered = true;

    for (const lockFile of lockFiles) {
      const fullPath = path.join(profilePath, lockFile);
      if (fs.existsSync(fullPath)) {
        try {
          if (os.platform() === 'win32') {
            // Test if we can unlink it. If it's an active process lock, this will throw.
            fs.unlinkSync(fullPath);
          } else {
            fs.unlinkSync(fullPath);
          }
        } catch (err: any) {
          // If we cannot remove it, the process is likely still running and holding the lock.
          if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
            recovered = false;
            console.error(`[ChromeLockRecovery] Cannot remove active lock file: ${fullPath} (${err.code})`);
          } else {
            console.error(`[ChromeLockRecovery] Error removing lock file: ${fullPath} - ${err.message}`);
          }
        }
      }
    }

    return recovered;
  }
}
