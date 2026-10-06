<script lang="ts">
    import type { Snippet } from "svelte";

    const {
        number,
        title,
        children,
    }: {
        number: number;
        title: string;
        children: Snippet;
    } = $props();
</script>

<li class="group/step flex gap-4">
    <div class="flex flex-col items-center">
        <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-sm font-semibold text-foreground tabular-nums"
            aria-hidden="true"
        >
            {number}
        </span>
        <span class="mt-2 w-px flex-1 bg-border group-last/step:hidden" aria-hidden="true"></span>
    </div>
    <div class="min-w-0 flex-1 pb-10 group-last/step:pb-0">
        <h2 class="flex min-h-8 items-center text-base font-semibold tracking-tight text-foreground">{title}</h2>
        <div class="mt-2 space-y-4 text-sm leading-relaxed text-muted-foreground">
            {@render children()}
        </div>
    </div>
</li>
