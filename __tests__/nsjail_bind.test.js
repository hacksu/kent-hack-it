import { describe, it, expect, beforeEach } from 'bun:test';
import { buildRbinds } from '../handler/utils_h';

const BINS_FOLDER = '/app/ctf';

describe('buildRbinds', () => {
    let rbinds = [];

    beforeEach(() => {
        rbinds = [];
    });

    it('should handle a /lib file', () => {
        buildRbinds(['/lib/x86_64-linux-gnu/libc.so.6'], rbinds);
        expect(rbinds).toEqual(['-R', '/lib/x86_64-linux-gnu/libc.so.6']);
    });

    it('should handle a challenge binary file', () => {
        buildRbinds(['challenge'], rbinds);
        expect(rbinds).toEqual(['-R', `${BINS_FOLDER}/challenge:/challenge`]);
    });

    it('should handle a mix of lib and challenge files', () => {
        buildRbinds(['/lib/x86_64-linux-gnu/libc.so.6', 'challenge'], rbinds);
        expect(rbinds).toEqual([
            '-R', '/lib/x86_64-linux-gnu/libc.so.6',
            '-R', `${BINS_FOLDER}/challenge:/challenge`,
        ]);
    });

    it('should mutate the passed array in place', () => {
        const original = rbinds;
        buildRbinds(['challenge'], rbinds);
        expect(rbinds).toBe(original);
        expect(original.length).toBeGreaterThan(0);
    });

    it('should handle an empty files array', () => {
        buildRbinds([], rbinds);
        expect(rbinds).toEqual([]);
    });

    it('should handle multiple files appending to existing rbinds', () => {
        rbinds.push('-R', '/existing');
        buildRbinds(['challenge'], rbinds);
        expect(rbinds).toEqual([
            '-R', '/existing',
            '-R', `${BINS_FOLDER}/challenge:/challenge`,
        ]);
    });
});