<script lang="ts">
    const { nc_instances } = $props();

    const NC_SESSION_MINUTES = 15;

    function timeRemaining(created_at: string | Date): string {
        const expiresAt = new Date(created_at).getTime() + NC_SESSION_MINUTES * 60 * 1000;
        const remainingMs = expiresAt - Date.now();
        if (remainingMs <= 0) return "expired";

        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
</script>

<div class="instances-tab">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Active Instances</h5>
        <span class="badge bg-primary fs-6">
            {nc_instances.length} Instance{nc_instances.length !== 1 ? 's' : ''}
        </span>
    </div>

    {#if nc_instances.length === 0}
        <p class="text-muted fst-italic">No active instances.</p>
    {:else}
        <table class="table table-hover align-middle">
            <thead>
                <tr>
                    <th>Player</th>
                    <th>Challenge</th>
                    <th>Port</th>
                    <th>Time Remaining (est.)</th>
                </tr>
            </thead>
            <tbody>
                {#each nc_instances as instance (instance.uid)}
                    <tr>
                        <td>{instance.player_name}</td>
                        <td>{instance.challenge_name ?? "—"}</td>
                        <td>{instance.port}</td>
                        <td>{timeRemaining(instance.created_at)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
