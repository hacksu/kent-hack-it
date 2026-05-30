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
<div style="padding: 10px">
    <p>You are being logged out...</p>
</div>