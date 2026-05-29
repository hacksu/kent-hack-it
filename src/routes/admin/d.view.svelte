<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import type { ChallengeData } from '$lib/database/db';

    let result: {
        success?:boolean,
        error?:string,
        message?:string
    } | undefined = $state(undefined);

    function clearResult() {
        result = undefined;
    }

    async function toggleChallenge(id: string, name: string, data: { is_active: boolean, is_gym: boolean }) {
        try {
            const req = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: 'challenge',
                    action: 'toggle',
                    id,
                    is_active: data.is_active,
                    is_gym: data.is_gym,
                })
            });
    
            result = await req.json();
    
        } catch (e: any) {
            result = {
                error: "Error Occurred!"
            };
        }

        // re-run the load in +page.server.ts updating the challenges collection
        await invalidateAll();
        setTimeout(clearResult, 5000);
    }

    async function deleteChallenge(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE the challenge "${name}"?`)) {
            const req = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'challenge', action: 'delete', id })
            });

            result = await req.json();
            result.message = `"${name}" has been deleted`;
            
            // re-run the load in +page.server.ts updating the challenges collection
            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }
    
    import ChallengeForm from '$lib/components/challenge.form.svelte';
    let showEditPanel = $state(false);
    let originalData: ChallengeData|undefined = $state(undefined);
    function openPanel(entry: ChallengeData) { originalData = entry; showEditPanel = true; }
    function exitPanel() { showEditPanel = false; }

    const { uploaded_files, challenges, form } = $props();
</script>

<!-- START OF PANEL -->

{#if showEditPanel}
    <div class="edit-overlay">
        <div>
            <button title="Close Panel" class="btn btn-lg btn-secondary" onclick={exitPanel}>
                Close
            </button>

            <ChallengeForm
                title="Edit Challenge"
                action_target="?/edit_challenge"
                challenge={originalData}
                onSubmit={(data: { success: boolean, message?: string, error?: string }|undefined) => {
                    showEditPanel = false;
                    if (data) {
                        result = data;
                    } else {
                        result = { error: 'An error occurred' };
                    }
                    setTimeout(clearResult, 5000);
                }}
                result={form}
                uploaded_files={uploaded_files}
            />
        </div>
    </div>
{/if}

<!-- END OF PANEL -->

<div>
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

    <!-- form feedback -->
    {#if form?.result?.success}
        <div class="view-feedback">
            <div class="view-alert">{form.result.message}</div>
        </div>
    {:else if form?.result?.error}
        <div class="view-feedback">
            <div class="view-alert view-err">{form.result.error}</div>
        </div>
    {/if}

    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Current Challenges</h5>
        <span class="badge bg-primary fs-6">
            {challenges.length} Challenge{challenges.length !== 1 ? 's' : ''}
        </span>
    </div>

    <ul class="row">
        {#each challenges as challenge}
            <div class="col-12 col-sm-6 col-md-3 col-lg-3 mb-3" 
                 style="max-width: 400px;">
                <div class="card h-100 shadow-sm p-2">

                    <div class="container" style="display: flex; gap: 10px;">
                        <!-- Enable / Disable -->
                        <div class="d-flex justify-content-between pt-2">
                            <button
                                class={`btn ${challenge.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                onclick={() => { toggleChallenge(challenge.id, challenge.name, { is_active: !challenge.is_active, is_gym: challenge.is_gym }) }}
                            >
                                {challenge.is_active ? 'Disable' : 'Enable'}
                            </button>
                        </div>

                        <!-- Is Live / Is Gym -->
                        <div class="d-flex justify-content-between pt-2">
                            <button
                                class={`btn ${challenge.is_gym ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                onclick={() => { toggleChallenge(challenge.id, challenge.name, { is_active: challenge.is_active, is_gym: !challenge.is_gym }) }}
                            >
                                {challenge.is_gym ? 'Set Live' : 'Set Gym'}
                            </button>
                        </div>
                    </div>

                    <!-- Challenge Info -->
                    <div class="card-body p-2">
                        <h6 class="card-title mb-1">{challenge.name}</h6>
                        <small class="text-muted" style="font-size:1.25rem;">
                            {challenge.category} | Difficulty: {challenge.difficulty}
                        </small>

                        <div class="mb-1">
                            <small class="text-info">
                                <i class="fas fa-user"></i> By: {challenge.written_by || 'Unknown Author'}
                            </small>
                        </div>

                        <p class="card-text small mt-2" 
                           style="font-size:1.25rem; max-height:150px; overflow-y:auto; padding-right:8px;"
                        >
                        <!-- challenge description -->
                        </p>

                        <p class="card-text small mb-1" style="font-size:1.25rem;">
                            ⭐ {Number(challenge.rating).toFixed(1)} / 5
                        </p>

                        <p class="card-text small" style="font-size:1.25rem;">
                            Points: {challenge.points}
                        </p>
                    </div>

                    <!-- Edit / Delete -->
                    <div class="container">
                        <div class="d-flex justify-content-between pt-2">
                            <button class="btn btn-outline-info" onclick={() => { openPanel(challenge) }}>
                                <i class="bi bi-pencil me-2"></i> Edit
                            </button>

                            <button class="btn btn-outline-danger" onclick={() => { deleteChallenge(challenge.id, challenge.name) }}>
                                <i class="bi bi-trash me-2"></i> Delete
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        {/each}
    </ul>
</div>