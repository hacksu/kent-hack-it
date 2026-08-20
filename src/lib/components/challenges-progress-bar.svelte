<script lang="ts">
    const { solved, total }: { solved: number; total: number } = $props();

    const pct = $derived(total > 0 ? Math.round((solved / total) * 100) : 0);
</script>

<div class="px-4 pt-3 pb-3">
    <div class="h-[6px] overflow-hidden rounded-full bg-muted">
        <div
            class="h-full rounded-full"
            style:width="{pct}%"
            style="background:var(--seq-4);"
            title="{solved} / {total} challenges solved ({pct}%)"
        ></div>
    </div>
    <p class="mt-1.5 text-[0.68rem] text-muted-foreground">
        {solved} / {total} challenges solved ({pct}%)
    </p>
</div>
