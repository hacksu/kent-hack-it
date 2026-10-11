<script lang="ts">
    import { cn } from "$lib/browser_utils.js";
    import Check from "@lucide/svelte/icons/check";
    import Copy from "@lucide/svelte/icons/copy";

    const {
        value,
        prompt = "$",
        label = "Copy command",
        class: className = undefined,
    }: {
        /** Text shown and copied. */
        value: string;
        /** Leading prompt glyph; pass an empty string for plain values such as passwords. */
        prompt?: string;
        label?: string;
        class?: string;
    } = $props();

    let copied = $state(false);
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    async function copy() {
        try {
            await navigator.clipboard.writeText(value);
            copied = true;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => (copied = false), 1500);
        } catch {
            // Clipboard is unavailable (insecure origin); the text is still selectable.
        }
    }
</script>

<div
    class={cn(
        "flex items-center gap-2.5 rounded-lg border border-border bg-terminal py-1.5 pr-1.5 pl-3 font-mono text-sm text-terminal-foreground",
        className
    )}
>
    {#if prompt}
        <span class="text-brand-green select-none" aria-hidden="true">{prompt}</span>
    {/if}
    <code class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap select-all">{value}</code>
    <button
        type="button"
        class="flex size-7 shrink-0 items-center justify-center rounded-md text-terminal-foreground/60 transition-colors hover:bg-white/10 hover:text-terminal-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied" : label}
        onclick={copy}
    >
        {#if copied}
            <Check class="size-3.5 text-brand-green" />
        {:else}
            <Copy class="size-3.5" />
        {/if}
    </button>
</div>
