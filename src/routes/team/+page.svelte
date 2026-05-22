<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';
    
    import Feedback from '$lib/components/feedback.svelte';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function AcceptRequest(rid: any, checksum: string, name: string) {
        if (window.confirm(`Are you sure you want to ${name} to join?`)) {
            const req = await fetch('/team?m=accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rid: rid, r_checksum: checksum })
            });

            const resp = await req.json();
            if (resp.success) {
                success = resp.message;
            } else {
                error = resp.error;
            }

            setTimeout(clearResult, 5000);
            await invalidateAll();
        }
    }

    async function RemoveMember(uid: any, name: any, team_id: any) {
        if (window.confirm(`Are you sure you want to remove ${name}?`)) {
            const req = await fetch('/team?m=rm_member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, name, team_id })
            });

            const resp = await req.json();
            if (resp.success) {
                success = resp.message;
            } else {
                error = resp.error;
            }

            setTimeout(clearResult, 5000);
            await invalidateAll();
        }
    }

    const { data } = $props();
</script>

{#if data.team}
<div class="container-fluid py-4">
    <Feedback success={success} warning={warning} error={error}  />

    <div class="d-flex justify-content-center align-items-start min-vh-100 pt-5">

        <div class="card border rounded-3 overflow-hidden w-100" style="max-width: 800px">

            <div class="card-header d-flex align-items-center justify-content-between bg-white border-bottom py-2 px-3">
                <span class="fw-medium">{data.team.name}</span>
                <span class="badge text-bg-secondary">{data.team.members.length + 1} / 4 members</span>
            </div>

            <div class="px-3 pt-3 pb-2 border-bottom">
                <p class="text-muted mb-2" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">Leader</p>
                <div class="d-flex align-items-center gap-2">
                    {#if data.team.leader.image}
                        <img
                            src={data.team.leader.image}
                            alt={data.team.leader.name}
                            class="rounded-circle"
                            width="32" height="32"
                            style="object-fit: cover;"
                            referrerpolicy="no-referrer"
                            crossorigin="anonymous"    
                        />
                    {:else}
                        <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-medium" style="width:32px; height:32px; font-size:12px;">
                            {data.team.leader.name.slice(0, 2).toUpperCase()}
                        </div>
                    {/if}
                    <div>
                        <p class="mb-0 small fw-medium">{data.team.leader.name}</p>
                        <p class="mb-0 text-muted" style="font-size: 11px;">Team leader</p>
                    </div>
                    <i class="ti ti-crown ms-auto" style="color: #BA7517;"></i>
                </div>
            </div>

            <div class="px-3 pt-3 pb-2 border-bottom">
                <p class="text-muted mb-2" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">Members</p>
                {#if data.team.members.length === 0}
                    <p class="text-muted small mb-2">No other members yet.</p>
                {:else}
                    <div class="d-flex flex-column gap-2 mb-1">
                        {#each data.team.members as member}
                            <div class="d-flex align-items-center gap-4">
                                {#if member.image}
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        class="rounded-circle"
                                        width="32" height="32"
                                        style="object-fit: cover;"
                                        referrerpolicy="no-referrer"
                                        crossorigin="anonymous"    
                                    />
                                {:else}
                                    <div class="rounded-circle bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center fw-medium" style="width:32px; height:32px; font-size:12px;">
                                        {member.name.slice(0, 2).toUpperCase()}
                                    </div>
                                {/if}
                                
                                <div>
                                    <p class="mb-0 small fw-medium">{member.name}</p>
                                </div>

                                <!-- only leader can see this -->
                                {#if data.is_leader}
                                    <button
                                        class="btn btn-outline-danger btn-sm"
                                        style="margin-left: 15px"
                                        onclick={ () => { RemoveMember(member.id, member.name, data.team.id) } }
                                    >
                                        Remove
                                    </button>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- only leader can see this -->
            {#if data.is_leader}
                <div class="px-3 pt-3 pb-2 border-bottom">
                    <p class="text-muted mb-2" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">Join Requests</p>
                    {#each data.team.requests as req}
                        <div class="d-flex align-items-center gap-2">
                            {#if req.image}
                                <img
                                    src={req.image}
                                    alt={req.name}
                                    class="rounded-circle"
                                    width="32" height="32"
                                    style="object-fit: cover;"
                                    referrerpolicy="no-referrer"
                                    crossorigin="anonymous"
                                />
                            {:else}
                                <div class="rounded-circle bg-secondary-subtle text-secondary d-flex align-items-center justify-content-center fw-medium" style="width:32px; height:32px; font-size:12px;">
                                    {req.name.slice(0, 2).toUpperCase()}
                                </div>
                            {/if}

                            <div>
                                <p class="mb-0 small">{req.name}</p>
                            </div>

                            <button
                                class="btn btn-outline-primary btn-sm"
                                style="margin-left: 15px"
                                onclick={ () => { AcceptRequest(req.id, req.checksum, req.name) } }
                            >
                                Accept
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}

            <div class="px-3 py-2 d-flex justify-content-end">
                <form method="POST" action="?/leave_team" use:enhance>
                    <input type="hidden" name="team_id" value={data.team.id} />
                    <button type="submit" class="btn btn-sm btn-outline-danger">
                        <i class="ti ti-logout"></i> Leave team
                    </button>
                </form>
            </div>

        </div>
    </div>
</div>
{:else}
<div class="container-fluid py-4">
    <Feedback success={success} warning={warning} error={error}  />

    <div class="row border rounded-3 overflow-hidden mx-0" style="min-height: 480px;">

        <div class="col-6 p-0 border-end d-flex flex-column">
            <div class="px-3 py-2 border-bottom bg-light">
                <span class="text-muted small fw-medium">Join a team</span>
            </div>
            <div class="overflow-y-auto flex-grow-1" style="max-height: 440px;">
                {#each data.teams as team}
                    <div class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                        <span class="small">{team.name}</span>
                        <form method="POST" action="?/request_join" use:enhance={() => {
                            return async ({ result, update }) => {
                                await update();
                                if (result.type === 'success' && result.data) {
                                    const data = result.data as {
                                        success: boolean;
                                        message?: string;
                                        error?: string;
                                    };

                                    if (data.success && data.message) {
                                        success = data.message;
                                    } else {
                                        error = data.error || "Error Occurred";
                                    }
                                } else {
                                    error = "Error Occurred";
                                }

                                await invalidateAll();
                                setTimeout(clearResult, 5000);
                            };
                        }}>
                            {#if team.pending}
                                <span class="btn-sm">Pending</span>
                            {:else}
                                <input type="hidden" name="team_id" value={team.id} />
                                <button class="btn btn-outline-secondary btn-sm" type="submit">
                                    Request to join
                                </button>
                            {/if}
                        </form>
                    </div>
                {/each}
            </div>
        </div>

        <div class="col-6 p-0 d-flex flex-column">
            <div class="px-3 py-2 border-bottom bg-light">
                <span class="text-muted small fw-medium">Create a team</span>
            </div>
            <div class="p-3 d-flex flex-column flex-grow-1">
                <form
                    method="POST"
                    action="?/create_team"
                    class="d-flex flex-column gap-3 flex-grow-1"
                    use:enhance={() => {
                        return async ({ result, update }) => {
                            await update();
                            if (result.type === 'success' && result.data) {
                                const data = result.data as {
                                    success: boolean;
                                    message?: string;
                                    error?: string;
                                };

                                if (data.success && data.message) {
                                    success = data.message;
                                } else {
                                    error = data.error || "Error Occurred";
                                }
                            } else {
                                error = "Error Occurred";
                            }

                            await invalidateAll();
                            setTimeout(clearResult, 5000);
                        };
                    }}
                >
                    <div>
                        <label for="team-name" class="form-label small fw-medium text-muted">Team name</label>
                        <input
                            type="text"
                            id="team-name"
                            name="name"
                            class="form-control form-control-sm"
                            placeholder="Enter team name" required
                        />
                    </div>
                    <div class="mt-auto">
                        <button class="btn btn-primary w-100 btn-sm" type="submit">Create team</button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</div>
{/if}