<script lang="ts">
    import ChallengeForm from '$lib/components/challenge.form.svelte';
    
    let result = $state(undefined);
    function clearResult() {
        result = undefined;
    }

    function scrollToFeedback() {
        const elem = document.getElementById('feedback-display');
        elem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    const { uploaded_files, form } = $props();
</script>

<div id="feedback-display">
    {#if result?.success}
        <div class="view-feedback">
            <div class="view-alert">{result.message}</div>
        </div>
    {:else if result?.error}
        <div class="view-feedback">
            <div class="view-alert view-err">{result.error}</div>
        </div>
    {/if}
</div>

<ChallengeForm
    title="Create a New Challenge"
    action_target="?/add_challenge"
    challenge={undefined}
    onSubmit={(data: { success: boolean, message: string }|undefined) => {
        if (data) {
            result = data;
        } else {
            result = { error: 'An error occurred' };
        }
        scrollToFeedback();
        setTimeout(clearResult, 5000);
    }}
    result={form}
    uploaded_files={uploaded_files}
/>