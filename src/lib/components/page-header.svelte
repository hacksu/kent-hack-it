<script lang="ts">
    import type { Snippet } from "svelte";

    const {
        eyebrow = undefined,
        title,
        description = undefined,
        children = undefined,
        actions = undefined,
    }: {
        eyebrow?: string;
        title: string;
        description?: string;
        /** Extra content under the description (e.g. a disclosure). */
        children?: Snippet;
        /** Right-aligned controls on the title row. */
        actions?: Snippet;
    } = $props();
</script>

<header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
        {#if eyebrow}
            <p class="eyebrow mb-1.5">{eyebrow}</p>
        {/if}
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {#if description}
            <p class="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        {/if}
        {@render children?.()}
    </div>
    {#if actions}
        <div class="flex shrink-0 items-center gap-2">
            {@render actions()}
        </div>
    {/if}
</header>
