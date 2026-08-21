<script lang="ts">
    const {
        categories,
    }: {
        categories: { label: string; value: number; total: number; avgPct?: number }[];
    } = $props();

    const rows = $derived(categories.map((c) => ({
        ...c,
        pct: c.total > 0 ? (c.value / c.total) * 100 : 0,
    })));
</script>

{#if rows.length > 0}
    <div class="flex flex-col gap-2.5 px-4 pt-3 pb-3">
        {#each rows as row}
            <div class="grid grid-cols-[minmax(0,110px)_1fr_auto] items-center gap-3 text-xs">
                <span class="truncate text-foreground" title={row.label}>{row.label}</span>
                <div class="relative h-2 rounded-full bg-muted">
                    <div class="h-full rounded-full bg-[var(--seq-4)]" style:width="{row.pct}%"></div>
                    {#if row.avgPct !== undefined}
                        <div
                            class="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-muted-foreground"
                            style:left="{row.avgPct}%"
                            title="event average {row.avgPct}%"
                        ></div>
                    {/if}
                </div>
                <span class="w-11 shrink-0 text-right font-semibold text-foreground">{row.value}/{row.total}</span>
            </div>
        {/each}
    </div>
{:else}
    <p class="px-4 py-6 text-center text-sm text-muted-foreground">No categories yet.</p>
{/if}
