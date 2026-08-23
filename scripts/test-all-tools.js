import { spawn } from 'child_process';

console.log("Running All Tests Validation...");

const test = spawn('npm', ['test'], { stdio: 'inherit' });

test.on('close', (code) => {
    if (code === 0) {
         console.log("✅ All tests passed successfully.");
    } else {
         console.error("❌ Test validation failed.");
         process.exit(1);
    }
});
