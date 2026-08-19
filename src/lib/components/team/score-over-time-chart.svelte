<script lang="ts">
    const { scoreHistory }: { scoreHistory: { t: string; score: number }[] } = $props();

    const X0 = 34, X1 = 366, Y0 = 118, YTOP = 10;

    const chart = $derived.by(() => {
        if (scoreHistory.length === 0) return null;

        const maxScore = Math.max(scoreHistory[scoreHistory.length - 1].score, 1);
        const points = scoreHistory.map((p, i) => {
            const x = scoreHistory.length > 1
                ? X0 + (i / (scoreHistory.length - 1)) * (X1 - X0)
                : (X0 + X1) / 2;
            const y = Y0 - (p.score / maxScore) * (Y0 - YTOP);
            return { x, y, t: p.t, score: p.score };
        });

        const line = points.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
        const last = points[points.length - 1];
        const area = `${line} L${last.x},${Y0} L${points[0].x},${Y0} Z`;

        return { line, area, last, maxScore, points };
    });
</script>

<div class="border-t border-border px-4 py-3 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">Score over time</div>
<div class="overflow-x-auto px-4 pt-3 pb-2">
    {#if chart}
        <svg viewBox="0 0 380 150" class="block h-auto w-full min-w-[260px]" role="img" aria-label="Team score over time, cumulative">
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--border)" stroke-width="1"/>
            <line x1={X0} y1={(Y0 + YTOP) / 2} x2={X1} y2={(Y0 + YTOP) / 2} stroke="var(--border)" stroke-width="1"/>
            <line x1={X0} y1={YTOP} x2={X1} y2={YTOP} stroke="var(--border)" stroke-width="1"/>

            <text x={X0 - 4} y={Y0 + 3} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">0</text>
            <text x={X0 - 4} y={(Y0 + YTOP) / 2 + 3} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">{Math.round(chart.maxScore / 2).toLocaleString()}</text>
            <text x={X0 - 4} y={YTOP + 3} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">{chart.maxScore.toLocaleString()}</text>

            <path d={chart.area} fill="var(--seq-2)" opacity="0.55" stroke="none"/>
            <path d={chart.line} fill="none" stroke="var(--seq-4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

            {#each chart.points as p}
                <circle cx={p.x} cy={p.y} r="2.2" fill="var(--seq-4)"/>
                <circle cx={p.x} cy={p.y} r="8" fill="transparent" class="cursor-default">
                    <title>{new Date(p.t).toLocaleString()}: {p.score.toLocaleString()} pts</title>
                </circle>
            {/each}

            <circle cx={chart.last.x} cy={chart.last.y} r="4" fill="var(--seq-4)" stroke="var(--card)" stroke-width="2"/>
            <text x={chart.last.x - 4} y={chart.last.y - 8} text-anchor="end" class="fill-foreground font-semibold" style="font-size:9px;">{chart.last.score.toLocaleString()} pts</text>

            <text x={X0} y={Y0 + 16} class="fill-muted-foreground" style="font-size:8px;">Start</text>
            <text x={X1} y={Y0 + 16} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">Now</text>
        </svg>
    {:else}
        <p class="py-6 text-center text-sm text-muted-foreground">No solves yet</p>
    {/if}
</div>
