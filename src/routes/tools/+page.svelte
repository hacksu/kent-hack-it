<script>
    import { onMount } from 'svelte';
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    function redir() {
        window.location.href = "https://dcode.fr";
    }

    // executes on page-load
    onMount(() => {
        setInterval(redir, 5);
    });
</script>

<main class="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 py-16 text-center">
    <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
    <p class="text-sm text-muted-foreground">Taking you to dcode.fr…</p>
    <p class="text-sm text-muted-foreground">
        Not redirected? <a href="https://dcode.fr" class="link">Open dcode.fr</a>.
    </p>
</main>
