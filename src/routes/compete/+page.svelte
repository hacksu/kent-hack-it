<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import Stats from '$lib/components/stats.svelte'

    import { type ViewableChallengeData } from '$lib/database/db.js';

    function clearResult() {
        error = warning = success = "";
    }
    let error = $state("");
    let warning = $state("");
    let success = $state("");

    const { data } = $props();

    let challenges: any[] = $state([]);
    let currentPage = $state(1);
    const challengesPerPage = 20;

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

        return filtered;
    }

    async function fetchChallenges() {
        try {
            if (!data.challenges) return;

            const categories = [...new Set<string>(data.challenges.map((c: any) => c.category))].sort();
            const difficultyOrder = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];
            const unique = [...new Set<string>(data.challenges.map((c: any) => c.difficulty))];
            const difficulties = difficultyOrder.filter(d => unique.includes(d));
            const ratings = ['4.0', '3.0', '2.0', '1.0', '0.0'];
            const authors = [...new Set<string>(data.challenges.map((c: any) => c.written_by).filter(Boolean))].sort();

            availableCategories = categories;
            availableDifficulties = difficulties;
            availableRatings = ratings;
            availableAuthors = authors;

            challenges = applyFilters(data.challenges);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }
    fetchChallenges();

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

    let showPanel = $state<boolean>(false);
    let challengeInfo = $state<ViewableChallengeData|undefined>(undefined);
    async function viewChallenge(cid: string|number) {
        // console.log(`Viewing cid -> ${cid}`);
        const data: any|undefined = currentChallenges.find(challenge => Number(challenge.id) === Number(cid));
        // console.log(`Data Fetched -> ${JSON.stringify(data)}`);

        showPanel = (data !== undefined) ? true : false;
        challengeInfo = data;
    }

</script>

<svelte:head>
    <link rel="stylesheet" href="/css/overlay.css">
</svelte:head>

<!-- START OF PANEL -->
{#if showPanel}
    <div class="challenge-overlay" role="presentation" onclick={() => showPanel = false}>
        <div>
            {#if challengeInfo}
                <Feedback success={success} warning={warning} error={error}  />

                <div role="presentation" class="card shadow" style="min-width: 400px; max-width: 550px;"
                    onclick={(e) => e.stopPropagation()}
                >
                    <!-- Header banner -->
                    <div class="card-header d-flex justify-content-between align-items-start"
                        style="background: linear-gradient(135deg, #61a7e8, #3a80c2); color: white;">
                        <div>
                            <h5 class="mb-1">{challengeInfo.name}</h5>
                            <p class="mb-1" style="font-size: 12px">Created By: {challengeInfo.written_by}</p>
                            <span class="badge bg-secondary me-1">{challengeInfo.category}</span>
                            <span class="badge {
                                challengeInfo.difficulty === 'Extreme' ? 'bg-danger' :
                                challengeInfo.difficulty === 'Hard' ? 'bg-warning text-dark' :
                                challengeInfo.difficulty === 'Medium' ? 'bg-info text-dark' :
                                challengeInfo.difficulty === 'Easy' ? 'bg-success' : 'bg-light text-dark'
                            }">{challengeInfo.difficulty}</span>
                        </div>
                        <button title="Close Panel" class="btn btn-sm btn-close btn-close-white" onclick={() => showPanel = false}></button>
                    </div>

                   <div class="card-body p-2">
                        {#if !challengeInfo.is_active}
                            <p>Challenge is currently Out-of-Order and will be back online soon!</p>
                        {/if}

                        {#if challengeInfo.description}
                            <div class="mb-2">
                                <p class="card-text small text-muted" style="font-size: 0.75rem">
                                    {challengeInfo.description}
                                </p>
                            </div>
                        {/if}
                        
                        <p class="card-text small mb-1">⭐ {Number(challengeInfo.rating).toFixed(1)} / 5</p>
                        <p class="card-text small">Points: {challengeInfo.points}</p>
                        <!--
                            <p class="card-text small">{challengeInfo.user_completions} Solves</p>
                        -->
                    </div>

                    <!-- Footer action -->
                    <div class="card-footer d-grid">
                        <form method="POST" action="?/submit_flag" use:enhance={() => {
                            return async ({ result, update }) => {
                                await update();
                                
                                if (result.type === 'success' && result.data) {
                                    // perform a cast to avoid error/warning popups
                                    const data = result.data as {
                                        success: boolean;
                                        message?: string;
                                        error?: string;
                                    };
                                    
                                    if (data.success && data.message) {
                                        success = data.message;
                                    } else {
                                        error = data.message ?? data.error ?? 'Error Occurred!';
                                    }
                                } else {
                                    error = 'Error Occurred!';
                                }

                                await invalidateAll();
                                setTimeout(clearResult, 5000);
                            };
                        }}>
                            <input type="hidden" name="cid" value={challengeInfo.id} />
                            <div class="input-group mt-2">
                                <input
                                    name="flag_value"
                                    type="text"
                                    class="form-control"
                                    placeholder="Enter Flag"
                                    required
                                />
                                <button type="submit" class="btn btn-primary">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                    
                </div>
            {:else}
                <div class="card h-100 shadow-sm p-2" style="position: relative">
                    <div class="card-body p-2">
                        <div class="view-feedback">
                            <div class="view-alert view-err">
                                Error getting challenge info.
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

        </div>
    </div>
{/if}

<!-- END OF PANEL -->

<main >
    <div class="container-fluid mt-4">

        <div class="row align-items-center mb-4">
            <Stats progressBars={ data.progressBars } />

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
                            <label for="search-text" class="form-label">Search</label>
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                placeholder="Search challenges..."
                                bind:value={filters.searchText}
                            />
                        </div>

                        <!-- Category -->
                        <div class="mb-3">
                            <label for="catagory-search" class="form-label">Category</label>
                            <select class="form-select form-select-sm" bind:value={filters.category}>
                                <option value="">All Categories</option>
                                {#each availableCategories as category}
                                    <option value={category}>{category}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Difficulty -->
                        <div class="mb-3">
                            <label for="difficulty-search" class="form-label">Difficulty</label>
                            <select class="form-select form-select-sm" bind:value={filters.difficulty}>
                                <option value="">All Difficulties</option>
                                {#each availableDifficulties as difficulty}
                                    <option value={difficulty}>{difficulty}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Rating -->
                        <div class="mb-3">
                            <label for="rating-search" class="form-label">Minimum Rating</label>
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
                            <label for="author-search" class="form-label">Author</label>
                            <select class="form-select form-select-sm" bind:value={filters.author}>
                                <option value="">All Authors</option>
                                {#each availableAuthors as author}
                                    <option value={author}>{author}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Individual Completion -->
                        <div class="mb-3">
                            <label for="completion-search" class="form-label">Individual Progress</label>
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
                <div class="flex-grow-1" style="position: relative">
                    {#if currentChallenges.length > 0}
                        <div class="row">
                            {#each currentChallenges as challenge, idx (challenge.id ?? idx)}
                                <div class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-3">
                                    <button
                                        class="text-decoration-none text-dark"
                                        style="border: none; background-color: #00000000;"
                                        onclick={ () => { viewChallenge(challenge.id) } }
                                    >
                                        <div class="card h-100 shadow-sm p-2 {!challenge.is_active ? 'opacity-50' : ''}" style="position: relative">

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
                                                            {challenge.description}
                                                        </p>
                                                    </div>
                                                {/if}
                                                <p class="card-text small mb-1">⭐ {Number(challenge.rating).toFixed(1)} / 5</p>
                                                <p class="card-text small">Points: {challenge.points}</p>
                                                <p class="card-text small">{challenge.user_completions} Solves</p>
                                            </div>
                                        </div>
                                    </button>
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