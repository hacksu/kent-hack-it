<script lang="ts">
    import ChallengeForm from '$lib/components/challenge.form.svelte';
    import Feedback from '$lib/components/feedback.svelte';
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

<div class="mx-auto w-full max-w-3xl">
    <div id="feedback-display">
        <Feedback
            success={result?.success ? (result.message ?? '') : ''}
            warning=""
            error={!result?.success && result?.error ? result.error : ''}
        />
    </div>

    <div class="overflow-clip rounded-xl border border-border bg-card">
        <ChallengeForm
            title="Create a new challenge"
            action_target="?/add_event"
            subaction_target="?/add_gym"
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
    </div>
</div>
