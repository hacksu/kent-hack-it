<script lang="ts">
	let { children } = $props();
</script>

<!-- inherits root layout; overlay.css / edit-overlay markup replaced by Dialog,
     view-feedback/alert markup replaced by Tailwind blocks (see d.*.svelte panels) -->
{@render children()}