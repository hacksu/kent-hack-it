<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$lib/utils.js";

    const {
        title = undefined,
        class: className = undefined,
        children,
        actions = undefined,
    }: {
        /** Mono caps label shown in the panel's header strip. */
        title?: string;
        class?: string;
        children: Snippet;
        /** Right-aligned content in the header strip. */
        actions?: Snippet;
    } = $props();
</script>

<section class={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
    {#if title || actions}
        <div class="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2">
            {#if title}
                <h2 class="eyebrow">{title}</h2>
            {/if}
            {#if actions}
                <div class="ml-auto flex items-center gap-2">
                    {@render actions()}
                </div>
            {/if}
        </div>
    {/if}
    {@render children()}
</section>
