import test from 'node:test';
import assert from 'node:assert';
import { SerpRankDriftTrackerService, PageSeoData, HistoricalRankData } from '../services/seo/serp-rank-drift-tracker.js';

test('SerpRankDriftTrackerService', async (t) => {
  await t.test('detectCannibalization should detect highly similar pages with same keyword', () => {
    const keyword = 'running shoes';
    const pages: PageSeoData[] = [
      {
        url: 'https://example.com/running-shoes',
        type: 'category',
        title: 'Best Running Shoes 2024',
        description: 'Shop the best running shoes for marathon and jogging.',
        h1: 'Running Shoes Collection',
        h2s: ['Men Running Shoes', 'Women Running Shoes']
      },
      {
        url: 'https://example.com/blog/best-running-shoes',
        type: 'article',
        title: 'Best Running Shoes 2024',
        description: 'We review the best running shoes for marathon and jogging.',
        h1: 'Top Running Shoes',
        h2s: ['Nike Running Shoes', 'Adidas Running Shoes']
      },
      {
         url: 'https://example.com/unrelated',
         type: 'article',
         title: 'Healthy Diet Tips',
         description: 'How to eat healthy.',
         h1: 'Diet Guide',
         h2s: []
      }
    ];

    const conflicts = SerpRankDriftTrackerService.detectCannibalization(pages, keyword);
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].url1, 'https://example.com/running-shoes');
    assert.strictEqual(conflicts[0].url2, 'https://example.com/blog/best-running-shoes');
    assert.ok(conflicts[0].similarityScore > 0.6);
  });

  await t.test('calculateSimilarity should correctly compute Jaccard index', () => {
     const score1 = SerpRankDriftTrackerService.calculateSimilarity('hello world', 'hello there world');
     assert.ok(score1 > 0 && score1 < 1);

     const score2 = SerpRankDriftTrackerService.calculateSimilarity('abc def', 'abc def');
     assert.strictEqual(score2, 1);

     const score3 = SerpRankDriftTrackerService.calculateSimilarity('abc def', 'ghi jkl');
     assert.strictEqual(score3, 0);
  });

  await t.test('trackRankDriftAndCannibalization should track drift and cannibalization', () => {
    const keyword = 'test shoes';
    const domain = 'example.com';
    const pages: PageSeoData[] = [
       {
         url: 'https://example.com/best-shoes',
         type: 'article',
         title: 'Test Shoes Guide',
         description: 'Guide for test shoes',
         h1: 'Test Shoes',
         h2s: []
       }
    ];

    // LiveSerpScraper mock returns:
    // https://example.com/best-shoes at pos 1
    // https://example.org/reviews/running-shoes at pos 2
    // https://example.com/product/123 at pos 3

    const historicalRanks: HistoricalRankData[] = [
       {
          keyword: 'test shoes',
          url: 'https://example.com/best-shoes',
          pastPosition: 5,
          date: new Date().toISOString()
       },
       {
          keyword: 'test shoes',
          url: 'https://example.com/product/123',
          pastPosition: 1, // dropped to 3 -> velocity -2
          date: new Date().toISOString()
       },
       {
          keyword: 'test shoes',
          url: 'https://example.com/lost-page',
          pastPosition: 4, // null now -> lost
          date: new Date().toISOString()
       }
    ];

    const result = SerpRankDriftTrackerService.trackRankDriftAndCannibalization(keyword, domain, pages, historicalRanks);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.keyword, keyword);
    assert.ok(result.rankDrift);

    const bestShoesDrift = result.rankDrift.find(r => r.url === 'https://example.com/best-shoes');
    assert.ok(bestShoesDrift);
    assert.strictEqual(bestShoesDrift.currentPosition, 1);
    assert.strictEqual(bestShoesDrift.pastPosition, 5);
    assert.strictEqual(bestShoesDrift.velocity, 4);
    assert.strictEqual(bestShoesDrift.velocityText, 'อันดับดีขึ้น 4 ตำแหน่ง');

    const productDrift = result.rankDrift.find(r => r.url === 'https://example.com/product/123');
    assert.ok(productDrift);
    assert.strictEqual(productDrift.currentPosition, 3);
    assert.strictEqual(productDrift.pastPosition, 1);
    assert.strictEqual(productDrift.velocity, -2);
    assert.strictEqual(productDrift.velocityText, 'อันดับลดลง 2 ตำแหน่ง');

    const lostDrift = result.rankDrift.find(r => r.url === 'https://example.com/lost-page');
    assert.ok(lostDrift);
    assert.strictEqual(lostDrift.currentPosition, null);
    assert.strictEqual(lostDrift.pastPosition, 4);
    assert.strictEqual(lostDrift.velocity, 0);
    assert.strictEqual(lostDrift.velocityText, 'หลุดจากอันดับ');
  });

  await t.test('trackRankDriftAndCannibalization should enforce SeoPolicyGuard and fail closed on keyword', () => {
    const keyword = 'มือสอง';

    assert.throws(() => {
      SerpRankDriftTrackerService.trackRankDriftAndCannibalization(keyword, 'example.com', [], []);
    }, /ถูกระงับเนื่องจากพบคำต้องห้าม/);
  });

  await t.test('trackRankDriftAndCannibalization should enforce SeoPolicyGuard and fail closed on page content', () => {
    const keyword = 'test shoes';
    const pages: PageSeoData[] = [
      {
         url: 'https://example.com/shoes',
         type: 'article',
         title: 'Test Shoes Guide มือสอง',
         description: 'Guide',
         h1: 'Test Shoes',
         h2s: []
      }
    ];

    assert.throws(() => {
      SerpRankDriftTrackerService.trackRankDriftAndCannibalization(keyword, 'example.com', pages, []);
    }, /เนื้อหาในหน้า .* ถูกระงับเนื่องจากพบคำต้องห้าม/);
  });
});
