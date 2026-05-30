<script>
    import { onMount } from 'svelte';

    function redir() {
        window.location.href = "https://discord.gg/rJDdvnt";
    }

    // executes on page-load
    onMount(() => {
        setInterval(redir, 5);
    });
</script>

<div style="padding: 10px">
    <p>You are being redirected in 5 seconds...</p>
    <p>If redirection failed <a href="https://discord.gg/rJDdvnt">click here</a>.</p>
</div>