<script lang="ts">
    import ChallengeForm from '$lib/components/challenge.form.svelte';
    import type { RegistryImages } from '$lib/server/registry';

    let result = $state<{success: boolean, message?: string, error?: string} | undefined>(undefined);
    function clearResult() {
        result = undefined;
    }

    function scrollToFeedback() {
        const elem = document.getElementById('feedback-display');
        elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    const { uploaded_files, registry_images, form } : {
        uploaded_files: {
            archives: string[];
            bins: string[];
            jail_confs: string[];
        },
        registry_images: RegistryImages,
        form: any
    } = $props();
</script>

<div id="feedback-display">
    {#if result?.success}
        <div class="mx-auto max-w-[37.5rem] rounded-lg border border-brand-green/40 bg-brand-green/10 px-3 py-2.5 text-center text-sm text-foreground">
            {result.message}
        </div>
    {:else if result?.error}
        <div class="mx-auto max-w-[37.5rem] rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
            {result.error}
        </div>
    {/if}
</div>

<ChallengeForm
    title="Create a New Challenge"
    action_target="?/add_challenge"
    challenge={undefined}
    onSubmit={(data: { success: boolean, message?: string, error?: string }|undefined) => {
        if (data) {
            result = data;
        } else {
            result = { success: false, error: 'An error occurred' };
        }
        scrollToFeedback();
        setTimeout(clearResult, 5000);
    }}
    result={form}
    uploaded_files={uploaded_files}
    registry_images={registry_images}
    requireFlag={true}
/>