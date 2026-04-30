<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    let result: {
        success?:boolean,
        error?:string,
        message?:string
    } | undefined = $state(undefined);

    function clearResult() {
        result = undefined;
    }

    async function deleteUser(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this player "${name}"?`)) {
            const req = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'user', action: 'delete', id })
            });

            result = await req.json();
            result.message = `"${name}" has been deleted`;
            
            // re-run the load in +page.server.ts updating the challenges collection
            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    const { users } = $props();

    // whenever searchTerm is modified filterUsers will be recomputed
    let searchTerm = $state("");
    const filteredUsers = $derived(
        users.filter(user => {
            return user.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );
</script>

<div class="users-tab">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Registered Players</h5>

        <!-- button fetch -->
        {#if result?.success}
            <div class="view-feedback">
                <div class="view-alert">{result.message}</div>
            </div>
        {:else if result?.error}
            <div class="view-feedback">
                <div class="view-alert view-err">{result.error}</div>
            </div>
        {/if}

        <span class="badge bg-primary fs-6">
            {users.length} Player{users.length !== 1 ? 's' : ''}
        </span>
    </div>

    <div class="mb-4">
        <input
            type="text"
            class="form-control"
            placeholder="Search players by username..."
            bind:value={searchTerm}
        />
    </div>

    <!-- User Cards -->
    <div class="row">

        {#each filteredUsers as user (user._id)}
            <div class="col-md-3 mb-3">
                <!-- 4 cards per row -->
                <div class="card shadow-sm border-0 h-100 rounded-3" style="font-size: 0.9rem;">
                    <div class="card-body d-flex flex-column justify-content-between p-3">

                        <!-- Top: Avatar + Username -->
                        <div class="d-flex align-items-center mb-2">
                            <img
                                src={user.image}
                                alt="{user.name}'s avatar"
                                class="rounded-circle me-2 shadow-sm"
                                style="width: 45px; height: 45px; object-fit: cover;"
                            />
                            <h6 class="card-title mb-0 fw-bold" style="font-size: 1rem;">
                                {user.name}
                            </h6>
                        </div>

                        <!-- Details -->
                        <div class="ms-1">
                            <p class="card-text text-muted mb-1">
                                <strong>Email:</strong> {user.email}
                            </p>
                            <p class="card-text text-muted mb-0">
                                <strong>Team ID:</strong> {user.team_id || "—"}
                            </p>
                        </div>

                        <!-- Action -->
                        <div class="mt-2">
                            <button
                                class="btn btn-sm btn-outline-danger w-100"
                                onclick={() => { deleteUser(user.id, user.name) }}
                            >
                                <i class="bi bi-trash me-1"></i> Remove
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        {/each}

    </div>
</div>