<script lang="ts">
    const {
        members, score, unit = "total pts",
    }: {
        members: { name: string; points: number; pct: number }[];
        score: number;
        /** Caption under the centre total. */
        unit?: string;
    } = $props();

    const R = 66;
    const CIRCUMFERENCE = 2 * Math.PI * R;
    const COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

    const segments = $derived.by(() => {
        if (score === 0 || members.length === 0) return [];

        let cumulative = 0;
        return members.map((m, i) => {
            const rawLen = (m.points / score) * CIRCUMFERENCE;
            const gapped = Math.max(rawLen - 3, 0);
            const seg = {
                color: COLORS[i % COLORS.length],
                dash: `${gapped} ${CIRCUMFERENCE - gapped}`,
                offset: -cumulative,
            };
            cumulative += rawLen;
            return seg;
        });
    });
</script>

{#if segments.length > 0}
    <div class="flex flex-col items-center gap-5 px-4 py-5 sm:flex-row sm:justify-center sm:gap-8">
        <svg viewBox="0 0 220 220" class="h-auto w-40 shrink-0" role="img" aria-label="Donut chart of team contribution by member">
            <circle cx="110" cy="110" r={R} fill="none" stroke="var(--muted)" stroke-width="22"/>
            <g transform="rotate(-90 110 110)">
                {#each segments as seg, i}
                    <circle cx="110" cy="110" r={R} fill="none" stroke={seg.color} stroke-width="22"
                            stroke-dasharray={seg.dash} stroke-dashoffset={seg.offset} class="cursor-default">
                        <title>{members[i].name}: {members[i].points.toLocaleString()} ({members[i].pct}%)</title>
                    </circle>
                {/each}
            </g>
            <text x="110" y="108" text-anchor="middle" class="fill-foreground font-mono" style="font-size:28px; font-weight:600;">{score.toLocaleString()}</text>
            <text x="110" y="130" text-anchor="middle" class="fill-muted-foreground" style="font-size:13px;">{unit}</text>
        </svg>
        <ul class="flex w-full min-w-0 flex-col gap-2 sm:max-w-64 sm:flex-1">
            {#each members as m, i}
                <li class="flex items-center gap-2.5 text-sm">
                    <span class="size-2.5 shrink-0 rounded-[3px]" style="background:{COLORS[i % COLORS.length]};"></span>
                    <span class="min-w-0 flex-1 truncate text-foreground">{m.name}</span>
                    <span class="pl-3 font-mono text-foreground tabular-nums">{m.points.toLocaleString()}</span>
                    <span class="w-10 text-right font-mono text-xs text-muted-foreground tabular-nums">{m.pct}%</span>
                </li>
            {/each}
        </ul>
    </div>
{:else}
    <p class="px-4 py-8 text-center text-sm text-muted-foreground">No solves yet</p>
{/if}
