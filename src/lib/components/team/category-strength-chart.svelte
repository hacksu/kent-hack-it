<script lang="ts">
    const {
        categories, teamName,
    }: {
        categories: { label: string; teamPct: number; avgPct: number }[];
        teamName: string;
    } = $props();

    const ROW_H = 32;
    const TRACK_X = 90, TRACK_W = 260;

    const rows = $derived(categories.map((c, i) => ({
        ...c,
        y: 14 + i * ROW_H,
        barWidth: (c.teamPct / 100) * TRACK_W,
        tickX: TRACK_X + (c.avgPct / 100) * TRACK_W,
    })));
</script>

{#if rows.length > 0}
    <div class="overflow-x-auto px-4 pt-3">
        <svg viewBox="0 0 380 {rows.length * ROW_H + 6}" class="block h-auto w-full min-w-[260px]" role="img" aria-label="Completion percent by category compared to the event average">
            {#each rows as row}
                <text x="0" y={row.y + 10} class="fill-foreground" style="font-size:9.5px;">{row.label}</text>
                <rect x={TRACK_X} y={row.y} width={TRACK_W} height="14" rx="4" fill="var(--muted)"/>
                <rect x={TRACK_X} y={row.y} width={row.barWidth} height="14" rx="4" fill="var(--seq-4)" class="cursor-default">
                    <title>{row.label}: {row.teamPct}%</title>
                </rect>
                <line x1={row.tickX} y1={row.y - 4} x2={row.tickX} y2={row.y + 18} stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" class="cursor-default">
                    <title>{row.label}: event average {row.avgPct}%</title>
                </line>
                <text x={TRACK_X + TRACK_W + 10} y={row.y + 10} class="fill-foreground font-semibold" style="font-size:9px;">{row.teamPct}%</text>
            {/each}
        </svg>
    </div>
{:else}
    <p class="px-4 py-6 text-center text-sm text-muted-foreground">No categories yet.</p>
{/if}
