/**
 * Presentation helpers for challenge difficulty. Class names are written out
 * in full so Tailwind can see them.
 */
const TONES: Record<string, { text: string; dot: string; badge: string }> = {
    Simple: {
        text: 'text-diff-simple',
        dot: 'bg-diff-simple',
        badge: 'border-diff-simple/30 bg-diff-simple/12 text-diff-simple',
    },
    Easy: {
        text: 'text-diff-easy',
        dot: 'bg-diff-easy',
        badge: 'border-diff-easy/30 bg-diff-easy/12 text-diff-easy',
    },
    Medium: {
        text: 'text-diff-medium',
        dot: 'bg-diff-medium',
        badge: 'border-diff-medium/30 bg-diff-medium/12 text-diff-medium',
    },
    Hard: {
        text: 'text-diff-hard',
        dot: 'bg-diff-hard',
        badge: 'border-diff-hard/30 bg-diff-hard/12 text-diff-hard',
    },
    Extreme: {
        text: 'text-diff-extreme',
        dot: 'bg-diff-extreme',
        badge: 'border-diff-extreme/30 bg-diff-extreme/12 text-diff-extreme',
    },
};

const FALLBACK = {
    text: 'text-muted-foreground',
    dot: 'bg-muted-foreground',
    badge: 'border-border bg-muted text-muted-foreground',
};

export function difficultyTone(difficulty: string) {
    return TONES[difficulty] ?? FALLBACK;
}
