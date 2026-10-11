function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Edit distance against any substring; also accepts adjacent transpositions.
function substringDistance(query: string, candidate: string): number {
    let previous = new Array<number>(candidate.length + 1).fill(0);
    let beforePrevious = previous;
    for (let i = 1; i <= query.length; i++) {
        const row = [i];
        for (let j = 1; j <= candidate.length; j++) {
            row[j] = Math.min(
                row[j - 1] + 1,
                previous[j] + 1,
                previous[j - 1] + (query[i - 1] === candidate[j - 1] ? 0 : 1)
            );
            if (i > 1 && j > 1 && query[i - 1] === candidate[j - 2] && query[i - 2] === candidate[j - 1]) {
                row[j] = Math.min(row[j], beforePrevious[j - 2] + 1);
            }
        }
        beforePrevious = previous;
        previous = row;
    }
    return Math.min(...previous);
}

function score(query: string, candidate: string): number {
    const contiguous = candidate.indexOf(query);
    if (contiguous !== -1) return contiguous / (candidate.length + 1);

    let position = 0;
    let first = -1;
    let last = -1;
    for (const character of query) {
        const match = candidate.indexOf(character, position);
        if (match === -1) {
            const distance = substringDistance(query, candidate);
            return distance <= Math.min(2, Math.floor(query.length / 4))
                ? 3 + distance
                : Infinity;
        }
        if (first === -1) first = match;
        last = match;
        position = match + 1;
    }
    return 1 + (last - first + 1 - query.length) / candidate.length;
}

/** Rank literal matches first, then abbreviations, then small spelling mistakes. */
export function fuzzySearch(options: string[], search: string): string[] {
    const query = normalize(search);
    if (!query) return [...options];
    return options
        .map(value => ({ value, score: score(query, normalize(value)) }))
        .filter(match => Number.isFinite(match.score))
        .sort((a, b) => a.score - b.score)
        .map(match => match.value);
}
