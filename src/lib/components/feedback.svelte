<script lang="ts">
    import CircleAlert from "@lucide/svelte/icons/circle-alert";
    import CircleCheck from "@lucide/svelte/icons/circle-check";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

    const { success, warning, error } : {
            success:string,
            warning:string,
            error:string
        } = $props();

    const baseClass = "mb-3 flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm";
</script>

<!-- Always-present live regions so screen readers announce results as they arrive -->
<div role="alert" class="contents">
    {#if error}
        <div class="{baseClass} border-destructive/40 bg-destructive/10 text-destructive">
            <CircleAlert class="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
        </div>
    {/if}
</div>
<div role="status" class="contents">
    {#if success}
        <div class="{baseClass} border-brand-green/40 bg-brand-green/10 text-brand-green">
            <CircleCheck class="mt-0.5 size-4 shrink-0" />
            <span>{success}</span>
        </div>
    {/if}
    {#if warning}
        <div class="{baseClass} border-warning/40 bg-warning/10 text-warning">
            <TriangleAlert class="mt-0.5 size-4 shrink-0" />
            <span>{warning}</span>
        </div>
    {/if}
</div>
