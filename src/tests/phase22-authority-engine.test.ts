import test from 'node:test';
import assert from 'node:assert';
import { AuthorityAssetRegistry, AuthorityAsset } from '../services/seo/authority-asset-registry.js';
import { PublisherRelevanceFilter } from '../services/seo/publisher-relevance-filter.js';
import { MentionObservationLedger, BrandMention, EarnedBacklink, DriftData } from '../services/seo/mention-observation-ledger.js';

test('AuthorityAssetRegistry', async (t) => {
  await t.test('registerAsset should store asset successfully if no negative keywords', () => {
    const registry = new AuthorityAssetRegistry();
    const asset: AuthorityAsset = {
      id: 'asset-1',
      type: 'checklist',
      title: 'SEO Checklist',
      content: 'Good content here',
      metadata: { keywords: ['seo', 'checklist'] }
    };
    registry.registerAsset(asset);
    assert.strictEqual(registry.getAsset('asset-1')?.id, 'asset-1');
  });

  await t.test('registerAsset should throw Error if negative keywords found', () => {
    const registry = new AuthorityAssetRegistry();
    const asset: AuthorityAsset = {
      id: 'asset-2',
      type: 'checklist',
      title: 'มือสอง SEO Checklist', // "มือสอง" is a negative keyword
      content: 'Some content',
      metadata: { keywords: ['seo'] }
    };
    assert.throws(() => registry.registerAsset(asset), /SeoPolicyGuard violation/);
  });
});

test('PublisherRelevanceFilter', async (t) => {
  const filter = new PublisherRelevanceFilter();

  await t.test('evaluateRelevance should return EXCLUDED for negative keywords', () => {
    const result = filter.evaluateRelevance('http://example.com/casino', 'เว็บ คาสิโน ออนไลน์'); // "คาสิโน" is excluded
    assert.strictEqual(result.status, 'EXCLUDED');
  });

  await t.test('evaluateRelevance should return RELEVANT for 2 or more relevant keywords', () => {
    const result = filter.evaluateRelevance('http://example.com/review', 'รีวิว สินค้า ดีมาก แนะนำ เลยครับ'); // "รีวิว", "สินค้า", "แนะนำ"
    assert.strictEqual(result.status, 'RELEVANT');
    assert.ok(result.score >= 2);
  });

  await t.test('evaluateRelevance should return UNCERTAIN for 1 relevant keyword', () => {
    const result = filter.evaluateRelevance('http://example.com/blog', 'วันนี้มา รีวิว กล้องใหม่'); // Only "รีวิว"
    assert.strictEqual(result.status, 'UNCERTAIN');
  });
});

test('MentionObservationLedger', async (t) => {
  await t.test('correlateDrift should return strong correlation for multiple mentions', () => {
    const ledger = new MentionObservationLedger();
    
    // Add mentions
    ledger.recordMention({
      id: 'm1', brandKeyword: 'MyBrand', sourceUrl: 'a.com', contextSnippet: 'good', timestamp: '2023-10-01'
    });
    ledger.recordMention({
      id: 'm2', brandKeyword: 'MyBrand', sourceUrl: 'b.com', contextSnippet: 'nice', timestamp: '2023-10-02'
    });
    ledger.recordMention({
      id: 'm3', brandKeyword: 'MyBrand', sourceUrl: 'c.com', contextSnippet: 'great', timestamp: '2023-10-03'
    });

    const drift: DriftData = {
      targetUrl: 'mybrand.com', keyword: 'MyBrand', previousRank: 10, currentRank: 5, timestamp: '2023-10-04'
    };

    const correlation = ledger.correlateDrift(drift);
    assert.strictEqual(correlation.correlationSignal, 'strong');
    assert.strictEqual(correlation.mentionsCount, 3);
  });

  await t.test('correlateDrift should return weak correlation for single mention', () => {
    const ledger = new MentionObservationLedger();
    
    ledger.recordMention({
      id: 'm1', brandKeyword: 'MyBrand', sourceUrl: 'a.com', contextSnippet: 'good', timestamp: '2023-10-01'
    });

    const drift: DriftData = {
      targetUrl: 'mybrand.com', keyword: 'MyBrand', previousRank: 10, currentRank: 5, timestamp: '2023-10-04'
    };

    const correlation = ledger.correlateDrift(drift);
    assert.strictEqual(correlation.correlationSignal, 'weak');
    assert.strictEqual(correlation.mentionsCount, 1);
  });
});
