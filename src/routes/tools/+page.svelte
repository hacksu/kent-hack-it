<script>
    import { onMount } from 'svelte';

    function redir() {
        window.location.href = "https://dcode.fr";
    }

    // executes on page-load
    onMount(() => {
        setInterval(redir, 5);
    });
</script>

<main class="flex min-h-[60vh] items-center justify-center px-4 py-10 text-center">
    <div class="space-y-2">
        <p class="text-muted-foreground">You are being redirected in 5 seconds...</p>
        <p class="text-muted-foreground">
            If redirection failed
            <a href="https://dcode.fr" class="text-brand-blue! underline underline-offset-4 hover:text-brand-green!">
                click here
            </a>.
        </p>
    </div>
</main>
