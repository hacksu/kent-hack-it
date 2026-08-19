<script lang="ts">
    const {
        members, score,
    }: {
        members: { name: string; points: number; pct: number }[];
        score: number;
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
    <div class="flex justify-center px-4 pt-5">
        <svg viewBox="0 0 220 220" class="h-auto w-full max-w-[240px]" role="img" aria-label="Donut chart of team score by member">
            <circle cx="110" cy="110" r={R} fill="none" stroke="var(--muted)" stroke-width="26"/>
            <g transform="rotate(-90 110 110)">
                {#each segments as seg, i}
                    <circle cx="110" cy="110" r={R} fill="none" stroke={seg.color} stroke-width="26"
                            stroke-dasharray={seg.dash} stroke-dashoffset={seg.offset} class="cursor-default">
                        <title>{members[i].name}: {members[i].points.toLocaleString()} pts ({members[i].pct}%)</title>
                    </circle>
                {/each}
            </g>
            <text x="110" y="105" text-anchor="middle" class="fill-foreground" style="font-size:26px; font-weight:700;">{score.toLocaleString()}</text>
            <text x="110" y="126" text-anchor="middle" class="fill-muted-foreground" style="font-size:11px;">total pts</text>
        </svg>
    </div>
    <div class="flex flex-col gap-2.5 px-5 py-5">
        {#each members as m, i}
            <div class="flex items-center gap-2.5">
                <span class="h-3 w-3 shrink-0 rounded-full" style="background:{COLORS[i % COLORS.length]};"></span>
                <span class="text-base font-medium text-foreground">{m.name}</span>
                <span class="ml-auto text-base text-foreground">{m.points.toLocaleString()}</span>
                <span class="w-11 text-right text-sm text-muted-foreground">({m.pct}%)</span>
            </div>
        {/each}
    </div>
{:else}
    <p class="px-4 py-6 text-center text-sm text-muted-foreground">No solves yet</p>
{/if}
