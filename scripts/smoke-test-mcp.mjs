// Smoke test: spawn the real MCP server over stdio and exercise the new tool.
import { spawn } from 'node:child_process';

const child = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });
let buffer = '';
const pending = new Map();

child.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        try {
            const msg = JSON.parse(line);
            if (msg.id && pending.has(msg.id)) {
                pending.get(msg.id)(msg);
                pending.delete(msg.id);
            }
        } catch (e) { /* ignore non-JSON lines */ }
    }
});
child.stderr.on('data', (c) => { if (process.env.VERBOSE) process.stderr.write(c); });

function send(msg) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout waiting for ' + msg.id)), 15000);
        pending.set(msg.id, (resp) => { clearTimeout(timer); resolve(resp); });
        child.stdin.write(JSON.stringify(msg) + '\n');
    });
}

try {
    await send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'smoke', version: '1.0.0' } } });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    const list = await send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
    const names = list.result.tools.map(t => t.name);
    console.log('tools/list count:', names.length);
    console.log('has predictive tool:', names.includes('ecommerce_predictive_inventory'));

    const call = await send({
        jsonrpc: '2.0', id: 3, method: 'tools/call',
        params: {
            name: 'ecommerce_predictive_inventory',
            arguments: {
                action: 'forecast',
                productId: 'SMOKE-001',
                platform: 'shopee',
                currentStock: 45,
                leadTimeDays: 7,
                targetCoverDays: 30,
                today: '2026-09-02',
                salesHistory: [
                    { date: '2026-08-26', unitsSold: 8 },
                    { date: '2026-08-27', unitsSold: 9 },
                    { date: '2026-08-28', unitsSold: 11 },
                    { date: '2026-08-29', unitsSold: 12 },
                    { date: '2026-08-30', unitsSold: 14 },
                    { date: '2026-08-31', unitsSold: 15 },
                    { date: '2026-09-01', unitsSold: 16 },
                ],
            },
        },
    });
    const parsed = JSON.parse(call.result.content[0].text);
    const f = parsed.forecast;
    console.log('forecast status:', parsed.status);
    console.log('risk:', f.risk, '| daysOfCover:', f.daysOfCover, '| stockout:', f.stockoutDate, '| reorderQty:', f.suggestedReorderQty);
    console.log('recommendation:', f.recommendation);
    console.log('SMOKE OK');
} catch (e) {
    console.error('SMOKE FAILED:', e.message);
    process.exitCode = 1;
} finally {
    child.kill();
}
