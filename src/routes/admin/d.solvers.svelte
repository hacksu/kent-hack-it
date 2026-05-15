<script lang="ts">
    let solvers = [];
    let challenges = [];

    let filters = {
        challengeFilter: '',
        userFilter: '',
        difficultyFilter: '',
        ratingFilter: '',
        authorFilter: ''
    };

    let availableChallenges = [];
    let availableUsers = [];
    let availableDifficulties = [];
    let availableRatings = [];
    let availableAuthors = [];

    const filteredSolvers = () => {
        let filtered = Object.entries(solvers);

        // Filter by challenge name
        if (filters.challengeFilter) {
            filtered = filtered.filter(([challenge_name]) => 
                challenge_name === filters.challengeFilter
            );
        }

        // Filter by username
        if (filters.userFilter) {
            filtered = filtered.filter(([, usernames]) => 
                usernames.includes(filters.userFilter)
            );
        }

        // Filter by difficulty
        if (filters.difficultyFilter) {
        }

        // Filter by rating (minimum rating)
        if (filters.ratingFilter) {
        }

        // Filter by author
        if (filters.authorFilter) {
        }

        return filtered;
    };

</script>

<div class="users-tab container-fluid py-3">
    <div class="row">

        <!-- Filter Sidebar -->
        <div class="col-md-3 col-lg-2">
            <div class="card p-3 mb-4">
                <h5 style="color:black; text-align:center;">Filters</h5>

                <!-- Challenge Filter -->
                <div class="mb-3">
                    <label for="challenge-filter" class="form-label">Challenge</label>
                    <select class="form-select form-select-sm"
                        value={filters.challengeFilter}
                        oninput={() => {}}>
                        <option value="">All Challenges</option>
                        {#each availableChallenges as challenge}
                            <option value={challenge}>{challenge}</option>
                        {/each}
                    </select>
                </div>

                <!-- User Filter -->
                <div class="mb-3">
                    <label for="user-filter" class="form-label">User</label>
                    <select class="form-select form-select-sm"
                        value={filters.userFilter}
                        oninput={() => {}}>
                        <option value="">All Users</option>
                        {#each availableUsers as user}
                            <option value={user}>{user}</option>
                        {/each}
                    </select>
                </div>

                <!-- Difficulty Filter -->
                <div class="mb-3">
                    <label for="difficulty-filter" class="form-label">Difficulty</label>
                    <select class="form-select form-select-sm"
                        value={filters.difficultyFilter}
                        oninput={() => {}}>
                        <option value="">All Difficulties</option>
                        {#each availableDifficulties as difficulty}
                            <option value={difficulty}>{difficulty}</option>
                        {/each}
                    </select>
                </div>

                <!-- Rating Filter -->
                <div class="mb-3">
                    <label for="rating-filter" lass="form-label">Minimum Rating</label>
                    <select class="form-select form-select-sm"
                        value={filters.ratingFilter}
                        oninput={() => {}}>
                        <option value="">All Ratings</option>
                        {#each availableRatings as rating}
                            <option value={rating}>
                                {rating}+ ⭐
                            </option>
                        {/each}
                    </select>
                </div>

                <!-- Author Filter -->
                <div class="mb-3">
                    <label for="author-filter" class="form-label">Author</label>
                    <select class="form-select form-select-sm"
                        value={filters.authorFilter}
                        oninput={() => {}}>
                        <option value="">All Authors</option>
                        {#each availableAuthors as author}
                            <option value={author}>{author}</option>
                        {/each}
                    </select>
                </div>

                <button class="btn btn-sm btn-outline-secondary w-100 mb-3"
                    onclick={() => {}}>
                    Clear Filters
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 col-lg-10">
            <div class="row g-3">

                {#if filteredSolvers.length > 0}
                    {#each filteredSolvers as [challenge_name, usernames]}
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div class="card shadow-sm border-0 h-100 rounded-3">
                                <div class="card-body d-flex flex-column p-3">
                                    <h6 class="card-title mb-3 fw-bold text-center text-primary">
                                        {SanitizeDescription(null, challenge_name)} - {usernames.length} solves
                                    </h6>

                                    <ul class="list-group list-group-flush flex-grow-1">
                                        {#if usernames.length > 0}
                                            {#each usernames as username}
                                                <li class="list-group-item py-1 px-2 border-0 text-muted"
                                                    style="font-size:0.9rem">
                                                    <i class="bi bi-person-fill me-2 text-secondary"></i>
                                                    {username}
                                                </li>
                                            {/each}
                                        {:else}
                                            <li class="list-group-item py-1 px-2 border-0 text-muted fst-italic">
                                                No solvers yet
                                            </li>
                                        {/if}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="col-12 text-center py-5">
                        <h4 class="text-muted">No challenges found</h4>
                        <button class="btn btn-outline-primary"
                            onclick={() => {}}>
                            Clear Filters
                        </button>
                    </div>
                {/if}

            </div>
        </div>
    </div>
</div>