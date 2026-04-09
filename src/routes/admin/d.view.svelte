<script lang="ts">
    let activeTab = "";
    const challenges = [];
    const editId = "";
</script>

<!--
    @todo - edit panel connected to this panel
-->

<div>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Current Challenges</h5>
        <span class="badge bg-primary fs-6">
            {challenges.length} Challenge{challenges.length !== 1 ? 's' : ''}
        </span>
    </div>

    <ul class="row">
        {#each challenges as challenge, idx}
            <div class="col-12 col-sm-6 col-md-3 col-lg-3 mb-3" 
                 style="max-width: 400px;">
                <div class="card h-100 shadow-sm p-2">

                    <!-- Enable / Disable -->
                    <div class="container">
                        <div class="d-flex justify-content-between pt-2">
                            <button
                                class={`btn ${challenge.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                onclick={() => {}}
                            >
                                {challenge.is_active ? 'Disable' : 'Enable'}
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
                            ⭐ {challenge.rating.toFixed(1)} / 5
                        </p>

                        <p class="card-text small" style="font-size:1.25rem;">
                            Points: {challenge.points}
                        </p>
                    </div>

                    <!-- Edit / Delete -->
                    <div class="container">
                        <div class="d-flex justify-content-between pt-2">
                            <button class="btn btn-outline-info" onclick={() => {}}>
                                <i class="bi bi-pencil me-2"></i> Edit
                            </button>

                            <button class="btn btn-outline-danger" onclick={() => {}}>
                                <i class="bi bi-trash me-2"></i> Delete
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        {/each}
    </ul>
</div>