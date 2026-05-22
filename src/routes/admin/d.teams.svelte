<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    
    import Feedback from '$lib/components/feedback.svelte';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function RemoveTeam(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this team "${name}"?`)) {
            const req = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'team', action: 'delete', id })
            });

            const response = await req.json();

            if (response) {
                if (response.success) {
                    success = `Successfully removed ${name}`;
                } else {
                    error = `Failed to remove ${name}`;
                }
            } else {
               error = "Error Occurred";
            }
            
            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    interface TeamInfo {
        id: string,
        name: string,
        leader: { name: string, image: string },
        members: { name: string, image: string }[],
    };
    const { teams } = $props();

    let searchTerm = $state("");
    const filteredTeams: TeamInfo[] = $derived(
        teams.filter((team: any) => {
            return team.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );
</script>

<div>
    <!-- Search Bar -->
    <div class="mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">
                Active Teams
                <span class="badge bg-primary ms-2">{teams.length} Team{teams.length !== 1 ? 's' : ''}</span>
            </h5>
            <Feedback success={success} warning={warning} error={error} />
        </div>

        <div class="d-flex gap-2">
            <input
                type="text"
                class="form-control"
                placeholder="Search team by name..."
                bind:value={searchTerm}
            />
            <button class="btn btn-primary text-nowrap" onclick={() => {}}>
                Force Update
            </button>
        </div>
    </div>

    <!-- Team Cards -->
    <div class="row">
        {#each filteredTeams as team (team.id)}
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100 rounded-3">
                    <div class="card-body d-flex flex-column">

                        <!-- Team Name -->
                        <h4 class="card-title text-primary fw-bold mb-3">
                            {team.name}
                        </h4>

                        <!-- Members -->
                        <h6 class="text-muted fw-semibold mb-2">Members</h6>

                        <ul class="list-group list-group-flush mb-3 small team-list">
                            <li class="list-group-item px-0 py-2 border-0 d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center gap-2">
                                    <img
                                        src={team.leader.image}
                                        alt="{team.leader.name}'s avatar"
                                        class="rounded-circle me-2 shadow-sm"
                                        style="width: 45px; height: 45px; object-fit: cover;"
                                        referrerpolicy="no-referrer"
                                        crossorigin="anonymous"
                                    />
                                    <span>{team.leader.name}</span>
                                </div>
                                <span class="badge text-bg-warning">Leader</span>
                            </li>

                            {#each team.members as member}
                                <li class="list-group-item px-0 py-2 border-0 d-flex align-items-center gap-2">
                                    <img
                                        src={member.image}
                                        alt="{member.name}'s avatar"
                                        class="rounded-circle me-2 shadow-sm"
                                        style="width: 45px; height: 45px; object-fit: cover;"
                                        referrerpolicy="no-referrer"
                                        crossorigin="anonymous"
                                    />
                                    <span>{member}</span>
                                </li>
                            {/each}
                        </ul>

                        <!-- Remove Button -->
                        <div class="mt-auto text-end">
                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick={() => { RemoveTeam(team.id, team.name) }}
                            >
                                <i class="bi bi-trash me-1"></i> Remove Team
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>