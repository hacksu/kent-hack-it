<script lang="ts">
    import { cn } from "$lib/utils.js";

    const {
        name,
        image = undefined,
        class: className = undefined,
    }: {
        name: string | null | undefined;
        image?: string | null;
        /** Size and text-size utilities; defaults to a 32px avatar. */
        class?: string;
    } = $props();

    // An avatar URL that 404s (deleted Discord/GitHub image) falls back to initials.
    let failed = $state(false);

    const initials = $derived(
        (name ?? "?")
            .trim()
            .split(/[\s_\-.]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "?"
    );
</script>

{#if image && !failed}
    <img
        src={image}
        alt=""
        class={cn("size-8 shrink-0 rounded-full border border-border bg-muted object-cover", className)}
        referrerpolicy="no-referrer"
        onerror={() => (failed = true)}
    />
{:else}
    <span
        class={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-mono text-xs font-medium text-secondary-foreground select-none",
            className
        )}
        aria-hidden="true"
    >
        {initials}
    </span>
{/if}
