<script lang="ts">
    const {
        categories,
    }: {
        categories: { label: string; value: number; total: number; avgPct?: number; color?: string }[];
    } = $props();

    const rows = $derived(categories.map((c) => ({
        ...c,
        pct: c.total > 0 ? (c.value / c.total) * 100 : 0,
    })));
</script>

{#if rows.length > 0}
    <div class="flex flex-col gap-3 px-4 py-4">
        {#each rows as row}
            <div class="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm">
                <span class="truncate text-foreground" title={row.label}>{row.label}</span>
                <div class="relative h-2 rounded-full bg-muted">
                    <div class="h-full rounded-full bg-brand-blue transition-[width] duration-500 ease-out" style:width="{row.pct}%"></div>
                    {#if row.avgPct !== undefined}
                        <div
                            class="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70"
                            style:left="{row.avgPct}%"
                            title="event average {row.avgPct}%"
                        ></div>
                    {/if}
                </div>
                <span class="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
                    <span class="font-medium text-foreground">{row.value}</span>/{row.total}
                </span>
            </div>
        {/each}
        {#if rows.some((row) => row.avgPct !== undefined)}
            <p class="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <span class="h-3.5 w-0.5 rounded-full bg-foreground/70"></span>
                Event average
            </p>
        {/if}
    </div>
{:else}
    <p class="px-4 py-8 text-center text-sm text-muted-foreground">No categories yet.</p>
{/if}
