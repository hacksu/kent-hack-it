<script lang="ts">
    const { series }: {
        series: { name: string; rank: number; history: { t: string; score: number }[] }[];
    } = $props();

    const X0 = 34, X1 = 366, Y0 = 118, YTOP = 20;
    const COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

    const chart = $derived.by(() => {
        const allPoints = series.flatMap((s) => s.history);
        if (allPoints.length === 0) return null;

        const times = allPoints.map((p) => new Date(p.t).getTime());
        const tMin = Math.min(...times);
        const tMax = Math.max(...times);
        const tSpan = tMax - tMin || 1;

        const maxScore = Math.max(
            1,
            ...series.map((s) => (s.history.length ? s.history[s.history.length - 1].score : 0))
        );

        const xOf = (t: string) => X0 + ((new Date(t).getTime() - tMin) / tSpan) * (X1 - X0);
        const yOf = (score: number) => Y0 - (score / maxScore) * (Y0 - YTOP);

        const lines = series.map((s, i) => {
            const points = s.history.map((p) => ({ x: xOf(p.t), y: yOf(p.score), t: p.t, score: p.score }));
            const line = points.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const last = points[points.length - 1];
            return { name: s.name, rank: s.rank, color: COLORS[i % COLORS.length], points, line, last };
        });

        return { lines, maxScore };
    });
</script>

<div class="border-t border-border px-4 py-3 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
    Score race
</div>

{#if chart}
    <div class="flex flex-col gap-1.5 px-4 pt-3">
        {#each chart.lines as l}
            <div class="flex items-center gap-2 text-xs">
                <span class="h-2 w-2 shrink-0 rounded-[2px]" style="background:{l.color};"></span>
                <span class="min-w-0 flex-1 truncate text-foreground">{l.name}</span>
                <span class="font-mono text-muted-foreground">
                    {(l.last?.score ?? 0).toLocaleString()}
                </span>
            </div>
        {/each}
    </div>

    <div class="overflow-x-auto px-4 pt-3 pb-2">
        <svg viewBox="0 0 380 150" class="block h-auto w-full min-w-[260px]" role="img" aria-label="Score over time for the top ranked teams">
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--border)" stroke-width="1" />
            <line x1={X0} y1={(Y0 + YTOP) / 2} x2={X1} y2={(Y0 + YTOP) / 2} stroke="var(--border)" stroke-width="1" />
            <line x1={X0} y1={YTOP} x2={X1} y2={YTOP} stroke="var(--border)" stroke-width="1" />

            <text x={X0 - 4} y={Y0 + 3} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">0</text>
            <text x={X0 - 4} y={(Y0 + YTOP) / 2 + 3} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">
                {Math.round(chart.maxScore / 2).toLocaleString()}
            </text>
            <text x={X0 - 4} y={YTOP + 3} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">
                {chart.maxScore.toLocaleString()}
            </text>

            {#each chart.lines as l}
                {#if l.points.length > 1}
                    <path d={l.line} fill="none" stroke={l.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                {/if}
                {#each l.points as p}
                    <circle cx={p.x} cy={p.y} r="2" fill={l.color} />
                    <circle cx={p.x} cy={p.y} r="7" fill="transparent" class="cursor-default">
                        <title>{`${l.name} ${new Date(p.t).toLocaleString()}: ${p.score.toLocaleString()} pts`}</title>
                    </circle>
                {/each}
                {#if l.last}
                    <circle cx={l.last.x} cy={l.last.y} r="3.5" fill={l.color} stroke="var(--card)" stroke-width="1.5" />
                {/if}
            {/each}

            <text x={X0} y={Y0 + 16} class="fill-muted-foreground" style="font-size:8px;">Start</text>
            <text x={X1} y={Y0 + 16} text-anchor="end" class="fill-muted-foreground" style="font-size:8px;">Now</text>
        </svg>
    </div>
{:else}
    <p class="py-6 text-center text-sm text-muted-foreground">No solves yet</p>
{/if}
