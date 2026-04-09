<script lang="ts">
    const teams = [];
    let searchTerm = "";

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
</script>

<div class="teams-tab">
    <!-- Search Bar -->
    <div class="mb-4 d-flex align-items-center gap-2">
        <input
            type="text"
            class="form-control flex-grow-1"
            placeholder="Search Team by name..."
            value={searchTerm}
            oninput={() => {}}
        />

        <button
            class="btn btn-primary"
            onclick={() => {}}
        >
            Force Update
        </button>
    </div>

    <!-- Team Cards -->
    <div class="row">
        {#each filteredTeams as team (team._id)}
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm border-0 h-100 rounded-3">
                    <div class="card-body d-flex flex-column">

                        <!-- Team Name -->
                        <h4 class="card-title text-primary fw-bold mb-3">
                            {team.name}
                        </h4>

                        <!-- Members -->
                        <h6 class="text-muted fw-semibold mb-2">Members</h6>
                        <ul class="list-group list-group-flush mb-3">
                            {#each team.members as member, index (index)}
                                <li
                                    class="list-group-item px-0 py-2 border-0 d-flex align-items-center"
                                >
                                    <i class="bi bi-person-circle me-2 text-secondary"></i>
                                    <span>{member}</span>
                                </li>
                            {/each}
                        </ul>

                        <!-- Remove Button -->
                        <div class="mt-auto text-end">
                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick={() => {}}
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