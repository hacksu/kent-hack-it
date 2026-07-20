<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import { Button } from '$lib/components/ui/button';
</script>

<Button onclick={toggleMode} variant="ghost" size="icon" aria-label="Toggle theme">
	<Sun class="h-5 w-5 dark:hidden" />
	<Moon class="hidden h-5 w-5 dark:block" />
</Button>
