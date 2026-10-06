<script lang="ts">
    import Trophy from "@lucide/svelte/icons/trophy";

    const { top3 }: { top3: { name: string; score: number }[] } = $props();

    // Visual order on wide screens is 2nd, 1st, 3rd; DOM order stays 1, 2, 3.
    const PLACES = [
        { label: "1st", tone: "text-gold", ring: "border-gold/40", wash: "from-gold/12", order: "sm:order-2", pad: "sm:pt-8 sm:pb-6" },
        { label: "2nd", tone: "text-foreground/70", ring: "border-border", wash: "from-foreground/5", order: "sm:order-1", pad: "" },
        { label: "3rd", tone: "text-[oklch(0.68_0.1_55)]", ring: "border-border", wash: "from-[oklch(0.68_0.1_55)]/8", order: "sm:order-3", pad: "" },
    ];
</script>

{#if top3.length > 0}
    <ol class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
        {#each top3 as entry, i (entry.name)}
            {@const place = PLACES[i]}
            <li
                class="flex items-center gap-4 rounded-xl border bg-gradient-to-b to-card to-70% px-5 py-4 sm:flex-col sm:gap-0 sm:text-center {place.ring} {place.wash} {place.order} {place.pad}"
            >
                <div class="flex flex-col items-center">
                    <Trophy class="{i === 0 ? 'size-6' : 'size-5'} {place.tone}" />
                    <span class="eyebrow mt-1 {place.tone}">{place.label}</span>
                </div>
                <div class="min-w-0 flex-1 sm:mt-3 sm:w-full sm:flex-none">
                    <p class="truncate font-semibold text-foreground {i === 0 ? 'text-lg' : 'text-base'}">{entry.name}</p>
                    <p class="font-mono text-sm text-muted-foreground tabular-nums sm:mt-0.5">
                        <span class="font-semibold text-foreground">{entry.score.toLocaleString()}</span> pts
                    </p>
                </div>
            </li>
        {/each}
    </ol>
{/if}
