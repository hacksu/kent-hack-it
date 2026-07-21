<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import Feedback from '$lib/components/feedback.svelte';

    const { instances } = $props();

    const NC_SESSION_MINUTES = 15;

    function timeRemaining(instance: any): string {
        const expiresAt = instance.type === 'ssh'
            ? new Date(instance.expires_at).getTime()
            : new Date(instance.created_at).getTime() + NC_SESSION_MINUTES * 60 * 1000;
        const remainingMs = expiresAt - Date.now();
        if (remainingMs <= 0) return "expired";

        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function shortId(instance: any): string {
        return instance.type === 'ssh'
            ? instance.container_id.slice(0, 12)
            : instance.cpid;
    }

    function clearResult() {
        error = success = "";
    }

    let error = $state("");
    let success = $state("");

    async function stopInstance(uid: string, playerName: string, type: string) {
        if (!window.confirm(`Are you sure you want to STOP ${playerName}'s instance?`)) return;

        const req = await fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: 'instance', action: 'stop', uid, type })
        });

        const response = await req.json();
        if (response?.success) {
            success = `Stopped ${playerName}'s instance`;
        } else {
            error = response?.error ?? "Failed to stop instance";
        }

        await invalidateAll();
        setTimeout(clearResult, 5000);
    }
</script>

<div class="instances-tab">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Active Instances</h5>

        <Feedback success={success} warning={""} error={error} />

        <span class="badge bg-primary fs-6">
            {instances.length} Instance{instances.length !== 1 ? 's' : ''}
        </span>
    </div>

    {#if instances.length === 0}
        <p class="text-muted fst-italic">No active instances.</p>
    {:else}
        <table class="table table-hover align-middle">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Player</th>
                    <th>Challenge</th>
                    <th>ID</th>
                    <th>Port</th>
                    <th>Time Remaining</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each instances as instance (`${instance.type}-${instance.uid}`)}
                    <tr>
                        <td><span class="badge bg-secondary">{instance.type}</span></td>
                        <td>{instance.player_name}</td>
                        <td>{instance.challenge_name ?? "—"}</td>
                        <td><code>{shortId(instance)}</code></td>
                        <td>{instance.port}</td>
                        <td>{timeRemaining(instance)}</td>
                        <td>
                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick={() => stopInstance(instance.uid, instance.player_name, instance.type)}
                            >
                                <i class="bi bi-stop-fill me-1"></i> Stop
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
