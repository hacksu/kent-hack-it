<script lang="ts">
    import type { Component, Snippet } from "svelte";
    import Info from "@lucide/svelte/icons/info";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
    import CircleCheck from "@lucide/svelte/icons/circle-check";

    type Tone = "info" | "warning" | "success";

    const {
        tone = "info",
        title = undefined,
        icon = undefined,
        children,
    }: {
        tone?: Tone;
        /** Bold lead-in line above the body. */
        title?: string;
        /** Overrides the default icon for the tone. */
        icon?: Component;
        children: Snippet;
    } = $props();

    const tones: Record<Tone, { box: string; accent: string; icon: Component }> = {
        info: { box: "border-brand-blue/30 bg-brand-blue/8", accent: "text-brand-blue", icon: Info },
        warning: { box: "border-warning/30 bg-warning/8", accent: "text-warning", icon: TriangleAlert },
        success: { box: "border-brand-green/30 bg-brand-green/8", accent: "text-brand-green", icon: CircleCheck },
    };

    const style = $derived(tones[tone]);
    const Icon = $derived(icon ?? style.icon);
</script>

<div class="flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm {style.box}" role="note">
    <Icon class="mt-0.5 size-4 shrink-0 {style.accent}" />
    <div class="min-w-0 flex-1 space-y-1.5 leading-relaxed text-foreground">
        {#if title}
            <p class="font-medium {style.accent}">{title}</p>
        {/if}
        {@render children()}
    </div>
</div>
