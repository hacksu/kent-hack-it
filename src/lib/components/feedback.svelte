<script lang="ts">
    import CircleAlert from "@lucide/svelte/icons/circle-alert";
    import CircleCheck from "@lucide/svelte/icons/circle-check";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

    const { success, warning, error } : {
            success:string,
            warning:string,
            error:string
        } = $props();
</script>

{#if error}
    <div class="mb-3 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
        <CircleAlert class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
    </div>
{/if}
{#if success}
    <div class="mb-3 flex items-start gap-2.5 rounded-lg border border-brand-green/40 bg-brand-green/10 px-3.5 py-2.5 text-sm text-brand-green">
        <CircleCheck class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{success}</span>
    </div>
{/if}
{#if warning}
    <div class="mb-3 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-400">
        <TriangleAlert class="mt-0.5 h-4 w-4 shrink-0" />
        <span>{warning}</span>
    </div>
{/if}
