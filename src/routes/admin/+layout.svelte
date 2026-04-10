<script lang="ts">
	let { children } = $props();
</script>

<!-- only applied to /admin pages -->
<svelte:head>
    <link rel="stylesheet" href="/css/overlay.css">
</svelte:head>

<!-- inherits root layout -->
{@render children()}