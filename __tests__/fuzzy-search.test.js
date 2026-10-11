import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fuzzySearch } from '../src/lib/fuzzy-search.ts';

const images = ['khi-web/profilepeek:latest', 'khi-web/padding-oracle:latest', 'khi-web/cookie-jar:latest'];
describe('registry image fuzzy search', () => {
    it('preserves registry order for empty queries', () => {
        assert.deepEqual(fuzzySearch(images, '  '), images);
    });
    it('ignores case and separators', () => {
        assert.equal(fuzzySearch(images, 'PADDING ORACLE')[0], images[1]);
    });
    it('matches abbreviations with skipped characters', () => {
        assert.equal(fuzzySearch(images, 'pdorcl')[0], images[1]);
    });
    it('tolerates small spelling mistakes and transpositions', () => {
        assert.equal(fuzzySearch(images, 'profielpeek')[0], images[0]);
        assert.equal(fuzzySearch(images, 'cookejar')[0], images[2]);
        assert.equal(fuzzySearch(images, 'cookuejar')[0], images[2]);
    });
    it('ranks literal matches ahead of sparse matches', () => {
        assert.deepEqual(fuzzySearch(['pqrsturo', 'profile'], 'pro'), ['profile', 'pqrsturo']);
    });
    it('rejects unrelated queries and does not mutate options', () => {
        assert.deepEqual(fuzzySearch(images, 'zzzzzz'), []);
        const original = [...images];
        fuzzySearch(images, 'cookie');
        assert.deepEqual(images, original);
    });
});
