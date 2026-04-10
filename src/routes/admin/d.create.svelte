<script lang="ts">
    import ChallengeForm from '$lib/components/challenge.form.svelte';
    const { form } = $props();
</script>

<ChallengeForm
    title="Create a New Challenge"
    action_target="?/add_challenge"
    challenge={undefined}
    result={form}
/>