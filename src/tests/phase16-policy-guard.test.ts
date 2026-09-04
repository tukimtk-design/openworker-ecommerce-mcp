import test from 'node:test';
import assert from 'node:assert/strict';
import { SeoPolicyGuard } from '../services/seo/seo-policy-guard.js';

test('SeoPolicyGuard - Accept safe text', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: 'สินค้าใหม่คุณภาพดีมาก' });
  assert.equal(result.isSafe, true);
  assert.equal(result.rejectedKeywords.length, 0);
});

test('SeoPolicyGuard - Reject negative keyword "มือสอง"', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: 'ขายสินค้ามือสองสภาพดี' });
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.rejectedKeywords, ['มือสอง']);
});

test('SeoPolicyGuard - Reject negative keyword "ปิดฝาฟอยล์"', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: 'กล่องปิดฝาฟอยล์อย่างดี' });
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.rejectedKeywords, ['ปิดฝาฟอยล์']);
});

test('SeoPolicyGuard - Reject negative keyword "กระปุก"', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: 'ครีมบำรุงผิว 1 กระปุก' });
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.rejectedKeywords, ['กระปุก']);
});

test('SeoPolicyGuard - Reject negative keyword "อย."', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: 'สินค้ามี อย. ปลอดภัย' });
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.rejectedKeywords, ['อย.']);
});

test('SeoPolicyGuard - Reject multiple negative keywords', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: 'สินค้ามือสองแบบกระปุก' });
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.rejectedKeywords, ['มือสอง', 'กระปุก']);
});

test('SeoPolicyGuard - Handle empty text gracefully', () => {
  const result = SeoPolicyGuard.checkPolicy({ text: '' });
  assert.equal(result.isSafe, true);
  assert.equal(result.rejectedKeywords.length, 0);
});

test('SeoPolicyGuard - Unicode NFC normalization works correctly', () => {
  // สร้างคำว่า 'มือสอง' โดยใช้ NFD (Normalization Form Decomposition) 
  // ม + ื + อ + ส + อ + ง
  const nfdText = '\u0E21\u0E37\u0E2D\u0E2A\u0E2D\u0E07'; 
  
  // ควรจะสามารถถูกตรวจจับได้หลังจาก normalization
  const result = SeoPolicyGuard.checkPolicy({ text: `ขาย ${nfdText}` });
  assert.equal(result.isSafe, false);
  assert.deepEqual(result.rejectedKeywords, ['มือสอง']);
});
