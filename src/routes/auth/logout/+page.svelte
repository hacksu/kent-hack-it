<script lang="ts">
    import { authClient } from "$lib/client";
    import { goto } from "$app/navigation"
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";

    async function handleLogout() {
        await authClient.signOut();
        goto("/auth/login");
    }
    setInterval(handleLogout, 1);
</script>

<!-- manual logout -->
<main class="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 py-16 text-center">
    <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
    <p class="text-sm text-muted-foreground">Logging you out…</p>
</main>
