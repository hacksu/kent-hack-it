<script lang="ts">
    const { solved, total }: { solved: number; total: number } = $props();

    const pct = $derived(total > 0 ? Math.round((solved / total) * 100) : 0);
</script>

<div class="px-4 py-4">
    <div class="flex items-baseline justify-between gap-3">
        <p class="text-sm text-muted-foreground">
            <span class="font-mono text-2xl font-semibold text-foreground tabular-nums">{solved}</span><span class="font-mono tabular-nums">/{total}</span>
            <span class="ml-1">challenges solved</span>
        </p>
        <span class="font-mono text-sm font-medium text-foreground tabular-nums">{pct}%</span>
    </div>
    <div
        class="mt-2.5 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={solved}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Challenges solved"
    >
        <div
            class="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-green transition-[width] duration-500 ease-out"
            style:width="{pct}%"
        ></div>
    </div>
</div>
