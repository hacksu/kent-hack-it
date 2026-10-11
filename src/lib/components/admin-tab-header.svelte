<script lang="ts">
    import type { Snippet } from "svelte";

    const { title, count = undefined, actions = undefined }: {
        title: string;
        count?: number | string;
        actions?: Snippet;
    } = $props();
</script>

<header class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex min-w-0 items-center gap-2.5">
        <h2 class="text-base font-semibold text-foreground">{title}</h2>
        {#if count !== undefined}
            <span class="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground tabular-nums" aria-label="Record count" aria-live="polite">{count}</span>
        {/if}
    </div>
    {#if actions}
        <div class="flex min-w-0 items-center gap-2">{@render actions()}</div>
    {/if}
</header>
