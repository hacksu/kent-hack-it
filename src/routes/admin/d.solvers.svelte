<script lang="ts">
    const { solvers, challenges }: {
        solvers: Record<number, string[]>,
        challenges: {
            id: number;
            name: string;
            description: string;
            category: string;
            difficulty: string;
            written_by: string | null;
            points: number;
            rating: string | null;
            hlinks: string[] | null;
            hints: string[] | null;
            is_active: boolean | null;
            is_gym: boolean | null;
        }[]
    } = $props();

    const difficultyOrder = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];

    let filters = $state({
        search: '',
        category: '',
        difficulty: '',
        author: '',
        rating: '',
    });

    let availableCategories = $derived([...new Set(challenges.map(c => c.category))].sort());
    let availableDifficulties = $derived(difficultyOrder.filter(d => challenges.some(c => c.difficulty === d)));
    let availableAuthors = $derived([...new Set(challenges.map(c => c.written_by).filter(Boolean))].sort() as string[]);
    let availableRatings = ['5.0', '4.0', '3.0', '2.0', '1.0'];

    function clearFilters() {
        filters = { search: '', category: '', difficulty: '', author: '', rating: '' };
    }

    let filteredChallenges = $derived((() => {
        let result = [...challenges];

        if (filters.search.trim()) {
            const term = filters.search.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.written_by?.toLowerCase().includes(term) ||
                c.category.toLowerCase().includes(term)
            );
        }

        if (filters.category) result = result.filter(c => c.category === filters.category);
        if (filters.difficulty) result = result.filter(c => c.difficulty === filters.difficulty);
        if (filters.author) result = result.filter(c => c.written_by === filters.author);
        if (filters.rating) result = result.filter(c => Number(c.rating) >= parseFloat(filters.rating));

        return result;
    })());

    function difficultyClass(difficulty: string) {
        return {
            'Extreme': 'bg-danger',
            'Hard': 'bg-warning text-dark',
            'Medium': 'bg-info text-dark',
            'Easy': 'bg-success',
            'Simple': 'bg-light text-dark',
        }[difficulty] ?? 'bg-secondary';
    }
</script>

<div class="container-fluid py-3">
    <div class="row">

        <!-- Filter Sidebar -->
        <div class="col-md-3 col-lg-2">
            <div class="card p-3 mb-4">
                <h5 class="text-center mb-3" style="color: black;">Filters</h5>

                <div class="mb-3">
                    <label for="search-filter" class="form-label small fw-medium text-muted">Search</label>
                    <input type="text" class="form-control form-control-sm" placeholder="Name, author..." bind:value={filters.search} />
                </div>

                <div class="mb-3">
                    <label for="category-filter" class="form-label small fw-medium text-muted">Category</label>
                    <select class="form-select form-select-sm" bind:value={filters.category}>
                        <option value="">All Categories</option>
                        {#each availableCategories as cat}
                            <option value={cat}>{cat}</option>
                        {/each}
                    </select>
                </div>

                <div class="mb-3">
                    <label for="difficulty-filter" class="form-label small fw-medium text-muted">Difficulty</label>
                    <select class="form-select form-select-sm" bind:value={filters.difficulty}>
                        <option value="">All Difficulties</option>
                        {#each availableDifficulties as diff}
                            <option value={diff}>{diff}</option>
                        {/each}
                    </select>
                </div>

                <div class="mb-3">
                    <label for="author-filter" class="form-label small fw-medium text-muted">Author</label>
                    <select class="form-select form-select-sm" bind:value={filters.author}>
                        <option value="">All Authors</option>
                        {#each availableAuthors as author}
                            <option value={author}>{author}</option>
                        {/each}
                    </select>
                </div>

                <div class="mb-3">
                    <label for="rate-filter" class="form-label small fw-medium text-muted">Minimum Rating</label>
                    <select class="form-select form-select-sm" bind:value={filters.rating}>
                        <option value="">All Ratings</option>
                        {#each availableRatings as r}
                            <option value={r}>{r}+ ⭐</option>
                        {/each}
                    </select>
                </div>

                <button class="btn btn-sm btn-outline-secondary w-100" onclick={clearFilters}>
                    Clear Filters
                </button>
            </div>
        </div>

        <!-- Challenge Cards -->
        <div class="col-md-9 col-lg-10">
            {#if filteredChallenges.length === 0}
                <div class="text-center py-5">
                    <h4 class="text-muted">No challenges found</h4>
                    <button class="btn btn-outline-primary mt-2" onclick={clearFilters}>Clear Filters</button>
                </div>
            {:else}
                <div class="row g-3">
                    {#each filteredChallenges as challenge (challenge.id)}
                        {@const challengeSolvers = solvers[challenge.id] ?? []}
                        <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
                            <div class="card h-100 shadow-sm border-0 rounded-3">

                                <div class="card-header d-flex justify-content-between align-items-center py-2 px-3"
                                    style="background: linear-gradient(135deg, #61a7e8, #3a80c2); color: white;">
                                    <span class="fw-medium small">{challenge.name}</span>
                                    <span class="badge {difficultyClass(challenge.difficulty)}">{challenge.difficulty}</span>
                                </div>

                                <div class="card-body p-3 d-flex flex-column">
                                    <p class="text-muted mb-1" style="font-size: 12px;">
                                        <i class="bi bi-person me-1"></i>{challenge.written_by ?? 'Unknown'}
                                    </p>
                                    <p class="text-muted mb-2" style="font-size: 12px;">
                                        <i class="bi bi-tag me-1"></i>{challenge.category}
                                        &nbsp;|&nbsp;
                                        ⭐ {Number(challenge.rating ?? 0).toFixed(1)}
                                    </p>

                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="badge text-bg-primary">{challengeSolvers.length} solve{challengeSolvers.length !== 1 ? 's' : ''}</span>
                                    </div>

                                    {#if challengeSolvers.length > 0}
                                        <ol class="list-group list-group-flush list-group-numbered flex-grow-1" style="font-size: 12px;">
                                            {#each challengeSolvers as username}
                                                <li class="list-group-item px-1 py-1 border-0 text-muted">
                                                    {username}
                                                </li>
                                            {/each}
                                        </ol>
                                    {:else}
                                        <p class="text-muted fst-italic small mt-auto mb-0">No solvers yet</p>
                                    {/if}
                                </div>

                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

    </div>
</div>