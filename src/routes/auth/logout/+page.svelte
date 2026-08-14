<script lang="ts">
    import { authClient } from "$lib/client";
    import { goto } from "$app/navigation"

    async function handleLogout() {
        await authClient.signOut();
        goto("/auth/login");
    }
    setInterval(handleLogout, 1);
</script>

<!-- manual logout -->
<main class="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 py-16 text-center">
    <span class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">// session</span>
    <p class="font-mono text-sm text-foreground">You are being logged out...</p>
</main>
