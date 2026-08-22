import { spawn } from 'child_process';

console.log("Running Phase 10 validation...");

const test = spawn('node', ['--test', 'dist/tests/phase10-autonomous.test.js'], { stdio: 'inherit' });

test.on('close', (code) => {
    if (code === 0) {
         console.log("✅ Phase 10 tools zero-token validation passed.");
    } else {
         console.error("❌ Phase 10 tools validation failed.");
         process.exit(1);
    }
});
