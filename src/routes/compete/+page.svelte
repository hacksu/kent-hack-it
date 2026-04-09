<script lang="ts">
    import { onMount } from 'svelte';

    let challenges: any[] = $state([]);
    let currentPage = $state(1);
    const challengesPerPage = 20;

    let profileData: any = $state(null);
    let teamData: any = $state(null);
    let joinedTeamName = $state('');

    let availableCategories: string[] = $state([]);
    let availableDifficulties: string[] = $state([]);
    let availableRatings: string[] = $state([]);
    let availableAuthors: string[] = $state([]);

    let filters = $state({
        category: '',
        difficulty: '',
        rating: '',
        author: '',
        searchText: '',
        showCompleted: false,
        showUncompleted: true,
        showTeamCompleted: false,
        showTeamUncompleted: true
    });

    async function getProfileDetails() {
        try {
            const response = await fetch('/api/user/info', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (data === null) {
                joinedTeamName = 'None';
            } else {
                joinedTeamName = data.team;
                profileData = data;
            }
        } catch (error) {
            console.error('Error sending request:', error);
        }
    }

    async function getTeamDetails() {
        try {
            const response = await fetch('/api/team/info', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            teamData = data;
        } catch (error) {
            console.error('Error sending request:', error);
        }
    }

    function applyFilters(data: any[]) {
        let filtered = [...data];

        if (filters.category) {
            filtered = filtered.filter(c => c.category === filters.category);
        }
        if (filters.difficulty) {
            filtered = filtered.filter(c => c.difficulty === filters.difficulty);
        }
        if (filters.rating) {
            const threshold = parseFloat(filters.rating);
            filtered = filtered.filter(c => c.rating >= threshold);
        }
        if (filters.author) {
            filtered = filtered.filter(c => c.written_by === filters.author);
        }
        if (filters.searchText) {
            const term = filters.searchText.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.category.toLowerCase().includes(term) ||
                (c.written_by && c.written_by.toLowerCase().includes(term))
            );
        }
        if (!filters.showCompleted || !filters.showUncompleted) {
            const userCompletions = profileData?.completions || [];
            filtered = filtered.filter(c => {
                const done = userCompletions.some((comp: any) => comp.id === c._id);
                return (filters.showCompleted && done) || (filters.showUncompleted && !done);
            });
        }
        if (!filters.showTeamCompleted || !filters.showTeamUncompleted) {
            const teamCompletions = teamData?.completions || [];
            filtered = filtered.filter(c => {
                const done = teamCompletions.some((comp: any) => comp.id === c._id);
                return (filters.showTeamCompleted && done) || (filters.showTeamUncompleted && !done);
            });
        }

        return filtered;
    }

    async function fetchChallenges() {
        try {
            const response = await fetch('/api/ctf/challenges');
            const data = await response.json();

            const categories = [...new Set<string>(data.map((c: any) => c.category))].sort();
            const difficultyOrder = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];
            const unique = [...new Set<string>(data.map((c: any) => c.difficulty))];
            const difficulties = difficultyOrder.filter(d => unique.includes(d));
            const ratings = ['4.0', '3.0', '2.0', '1.0', '0.0'];
            const authors = [...new Set<string>(data.map((c: any) => c.written_by).filter(Boolean))].sort();

            availableCategories = categories;
            availableDifficulties = difficulties;
            availableRatings = ratings;
            availableAuthors = authors;

            challenges = applyFilters(data);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }

    function clearFilters() {
        filters = {
            category: '',
            difficulty: '',
            rating: '',
            author: '',
            searchText: '',
            showCompleted: false,
            showUncompleted: true,
            showTeamCompleted: false,
            showTeamUncompleted: true
        };
    }

    // Pagination
    let indexOfLast = $derived(currentPage * challengesPerPage);
    let indexOfFirst = $derived(indexOfLast - challengesPerPage);
    let currentChallenges = $derived(challenges.slice(indexOfFirst, indexOfLast));
    let totalPages = $derived(Math.ceil(challenges.length / challengesPerPage) || 1);

    function nextPage() {
        if (indexOfLast < challenges.length) currentPage++;
    }
    function prevPage() {
        if (currentPage > 1) currentPage--;
    }

    // Reset page on filter change
    $effect(() => {
        filters;
        currentPage = 1;
    });

    // Refetch when profileData, teamData, or filters change
    $effect(() => {
        profileData; teamData; filters;
        fetchChallenges();
    });

    // Fetch team when joinedTeamName changes
    $effect(() => {
        if (joinedTeamName && joinedTeamName !== 'None') {
            getTeamDetails();
        }
    });

    onMount(async () => {
        await getProfileDetails();
    });
</script>

<main >
    <div class="container-fluid mt-4">

        <div class="row align-items-center mb-4">
            <div class="col-12 text-center">
                <h2 class="mb-0">Challenges</h2>
            </div>
        </div>

        <div class="row" style="position: relative; min-height: calc(100vh - 200px)">

            <!-- Filter Sidebar -->
            <div class="col-md-3 col-lg-2">
                <div class="card p-3 mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0" style="color: black; text-align: center">Filters</h5>
                        <button
                            class="btn btn-sm btn-outline-secondary d-md-none"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#filterCollapse"
                            aria-expanded="false"
                            aria-controls="filterCollapse"
                        >
                            Filter Options
                        </button>
                    </div>

                    <div class="collapse d-md-block" id="filterCollapse">

                        <!-- Search -->
                        <div class="mb-3">
                            <label class="form-label">Search</label>
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                placeholder="Search challenges..."
                                bind:value={filters.searchText}
                            />
                        </div>

                        <!-- Category -->
                        <div class="mb-3">
                            <label class="form-label">Category</label>
                            <select class="form-select form-select-sm" bind:value={filters.category}>
                                <option value="">All Categories</option>
                                {#each availableCategories as category}
                                    <option value={category}>{category}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Difficulty -->
                        <div class="mb-3">
                            <label class="form-label">Difficulty</label>
                            <select class="form-select form-select-sm" bind:value={filters.difficulty}>
                                <option value="">All Difficulties</option>
                                {#each availableDifficulties as difficulty}
                                    <option value={difficulty}>{difficulty}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Rating -->
                        <div class="mb-3">
                            <label class="form-label">Minimum Rating</label>
                            <select class="form-select form-select-sm" bind:value={filters.rating}>
                                <option value="">All Ratings</option>
                                {#each availableRatings as rating}
                                    <option value={rating}>
                                        {rating}+ ⭐ ({rating === '4.0' ? 'Excellent' : rating === '3.0' ? 'Good' : rating === '2.0' ? 'Fair' : 'Any'})
                                    </option>
                                {/each}
                            </select>
                        </div>

                        <!-- Author -->
                        <div class="mb-3">
                            <label class="form-label">Author</label>
                            <select class="form-select form-select-sm" bind:value={filters.author}>
                                <option value="">All Authors</option>
                                {#each availableAuthors as author}
                                    <option value={author}>{author}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Individual Completion -->
                        <div class="mb-3">
                            <label class="form-label">Individual Progress</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showCompleted" bind:checked={filters.showCompleted} />
                                <label class="form-check-label" for="showCompleted">
                                    My Completed
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="showUncompleted" bind:checked={filters.showUncompleted} />
                                <label class="form-check-label" for="showUncompleted">
                                    My Uncompleted
                                </label>
                            </div>
                        </div>

                        <!-- Team Completion -->
                        {#if teamData}
                            <div class="mb-3">
                                <label class="form-label">Team Progress</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showTeamCompleted" bind:checked={filters.showTeamCompleted} />
                                    <label class="form-check-label" for="showTeamCompleted">
                                        Team Completed
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showTeamUncompleted" bind:checked={filters.showTeamUncompleted} />
                                    <label class="form-check-label" for="showTeamUncompleted">
                                        Team Uncompleted
                                    </label>
                                </div>
                            </div>
                        {/if}

                        <button class="btn btn-sm btn-outline-secondary w-100 mb-3" onclick={clearFilters}>
                            Clear Filters
                        </button>

                        <div class="mt-4">
                            <hr class="mb-3" />
                            <a class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" href="/challenge_help">
                                Challenge Help
                            </a>
                        </div>

                        <div class="mt-4">
                            <a class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" href="/rate-challenge">
                                Rate Challenges
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="col-md-9 col-lg-10 d-flex flex-column">
                <div class="flex-grow-1" style="min-height: 1075px; position: relative">
                    {#if currentChallenges.length > 0}
                        <div class="row">
                            {#each currentChallenges as challenge, idx (challenge._id ?? idx)}
                                <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-3">
                                    <a
                                        href={challenge.is_active ? `/challenge?id=${challenge._id}` : undefined}
                                        class="text-decoration-none text-dark"
                                    >
                                        <div class="card h-100 shadow-sm p-2 {!challenge.is_active ? 'opacity-50' : ''}" style="position: relative">

                                            {#if teamData}
                                                <div
                                                    class="position-absolute"
                                                    style="top: 8px; right: 8px; z-index: 10; width: 24px; height: 24px"
                                                    title={teamData.completions?.some((c: any) => c.id === challenge._id) ? 'Completed by your team' : 'Not completed by your team'}
                                                >
                                                    <img
                                                        src={teamData.completions?.some((c: any) => c.id === challenge._id) ? '/team_complete.png' : '/team_nocomplete.png'}
                                                        alt={teamData.completions?.some((c: any) => c.id === challenge._id) ? 'Team completed' : 'Team not completed'}
                                                        style="width: 100%; height: 100%; object-fit: contain"
                                                    />
                                                </div>
                                            {/if}

                                            <div class="card-body p-2">
                                                {#if !challenge.is_active}
                                                    <p>Challenge is currently Out-of-Order and will be back online soon!</p>
                                                {/if}
                                                <h6 class="card-title mb-1">{challenge.name}</h6>
                                                <small class="text-muted">
                                                    {challenge.category} | Difficulty: {challenge.difficulty}
                                                </small>
                                                <div class="mb-1">
                                                    <small class="text-info">
                                                        By: {challenge.written_by || 'Unknown Author'}
                                                    </small>
                                                </div>
                                                {#if challenge.description}
                                                    <div class="mb-2">
                                                        <p class="card-text small text-muted" style="font-size: 0.75rem">
                                                            <SanitizeDescription description={challenge.description} maxLength={100} />
                                                        </p>
                                                    </div>
                                                {/if}
                                                <p class="card-text small mb-1">⭐ {challenge.rating.toFixed(1)} / 5</p>
                                                <p class="card-text small">Points: {challenge.points}</p>
                                                <p class="card-text small">{challenge.user_completions} Solves</p>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
                            <div class="text-center">
                                <h4 class="text-muted">No challenges found</h4>
                                <p class="text-muted">Try adjusting your filters to see more challenges.</p>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Pagination -->
            <div class="mt-3 py-3">
                <div class="d-flex justify-content-center align-items-center gap-4">
                    <button class="btn btn-sm btn-primary" onclick={prevPage} disabled={currentPage === 1}>
                        ← Prev
                    </button>
                    <span class="fw-semibold text-muted">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button class="btn btn-sm btn-primary" onclick={nextPage} disabled={indexOfLast >= challenges.length}>
                        Next →
                    </button>
                </div>
            </div>

        </div>
    </div>
    <div class="pb-5"></div>
</main>