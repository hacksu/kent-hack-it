<script lang="ts">
    const { top3 }: { top3: { name: string; score: number }[] } = $props();

    const order = $derived([top3[1], top3[0], top3[2]].filter((e) => !!e));
</script>

{#if top3.length > 0}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        {#each order as entry}
            {@const rank = top3.indexOf(entry) + 1}
            <div
                class="rounded-2xl border p-4 text-center {rank === 1
                    ? 'border-amber-400/40 bg-gradient-to-b from-amber-400/15 to-card pt-6'
                    : 'border-border bg-card'}"
            >
                <p class="font-mono text-xs font-bold {rank === 1 ? 'text-amber-400' : 'text-muted-foreground'}">
                    #{rank}
                </p>
                <p class="mt-1.5 text-sm font-semibold text-foreground">{entry.name}</p>
                <p class="mt-1 font-mono text-brand-green {rank === 1 ? 'text-xl' : 'text-base'}">
                    {entry.score.toLocaleString()}
                </p>
            </div>
        {/each}
    </div>
{/if}
