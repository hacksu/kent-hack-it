<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import Stats from '$lib/components/stats.svelte';

    import { type ViewableChallengeData } from '$lib/database/db.js';
    import { handleFormResult } from "$lib/utilities.js";

    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Separator } from "$lib/components/ui/separator";
    import * as Select from "$lib/components/ui/select";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
    import X from "@lucide/svelte/icons/x";

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    function clearResult() {
        error = warning = success = "";
    }

    const { data } = $props();

    let currentPage = $state(1);
    const challengesPerPage = 20;

    let filters = $state({
        category: '',
        difficulty: '',
        rating: '',
        author: '',
        searchText: '',
        showCompleted: true,
        showUncompleted: true,
    });

    let availableCategories = $derived(
        [...new Set<string>(
            (data.challenges ?? []).map((c: any) => c.category)
        )].sort()
    );

    let availableDifficulties = $derived(() => {
        const difficultyOrder = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];

        const unique = [...new Set<string>(
            (data.challenges ?? []).map((c: any) => c.difficulty)
        )];

        return difficultyOrder.filter(d => unique.includes(d));
    });

    let selectedRating = $state(0);
    let hoveredRating  = $state(0);
    let availableRatings = ['4.0', '3.0', '2.0', '1.0', '0.0'];

    let availableAuthors = $derived(
        [...new Set<string>(
            (data.challenges ?? [])
                .map((c: any) => c.written_by)
                .filter(Boolean)
        )].sort()
    );

    function applyFilters(dataSet: ViewableChallengeData[]) {
        let filtered = [...dataSet];

        // Category
        if (filters.category) {
            filtered = filtered.filter(
                c => c.category === filters.category
            );
        }

        // Difficulty
        if (filters.difficulty) {
            filtered = filtered.filter(
                c => c.difficulty === filters.difficulty
            );
        }

        // Rating
        if (filters.rating) {
            const threshold = parseFloat(filters.rating);

            filtered = filtered.filter(
                c => Number(c.rating) >= threshold
            );
        }

        // Author
        if (filters.author) {
            filtered = filtered.filter(
                c => c.written_by === filters.author
            );
        }

        // Search
        if (filters.searchText.trim()) {
            const term = filters.searchText.toLowerCase();

            filtered = filtered.filter((c) =>
                c.name?.toLowerCase().includes(term) ||
                c.category?.toLowerCase().includes(term) ||
                c.written_by?.toLowerCase().includes(term) ||
                c.description?.toLowerCase().includes(term)
            );
        }

        // Completion Filters
        filtered = filtered.filter((c) => {
            const completed = data.completions?.user?.some(
                (chall: any) => Number(c.id) === Number(chall.challenge_id)
            ) ?? false;

            // SELF-COMPLETIONS
            if (completed && !filters.showCompleted) {
                return false;
            }

            if (!completed && !filters.showUncompleted) {
                return false;
            }

            return true;
        });

        return filtered;
    }

    function hasSolved(cid: number) {
        return data.completions?.user?.some(
                (chall: any) => cid === Number(chall.challenge_id)
            ) ?? false;
    }

    function hasRated(cid: number) {
        return data.rated?.some(
            (ch_r) => cid === ch_r
        ) ?? false;
    }

    let challenges = $derived(
        applyFilters(data.challenges ?? [])
    );

    $effect(() => {
        filters;
        currentPage = 1;
    });

    let totalPages = $derived(
        Math.max(
            1,
            Math.ceil(challenges.length / challengesPerPage)
        )
    );

    let indexOfLast = $derived(
        currentPage * challengesPerPage
    );

    let indexOfFirst = $derived(
        indexOfLast - challengesPerPage
    );

    let currentChallenges = $derived(
        challenges.slice(indexOfFirst, indexOfLast)
    );

    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
        }
    }

    function clearFilters() {
        filters = {
            category: '',
            difficulty: '',
            rating: '',
            author: '',
            searchText: '',
            showCompleted: true,
            showUncompleted: true,
        };
    }

    let showPanel = $state<boolean>(false);

    let challengeInfo = $state<ViewableChallengeData | undefined>(
        undefined
    );

    async function viewChallenge(cid: string | number) {
        const challenge = challenges.find(
            (c) => Number(c.id) === Number(cid)
        );

        challengeInfo = challenge;
        showPanel = challenge !== undefined;
    }

    // Styling helper: maps a challenge difficulty to a badge color, mirroring
    // the previous Bootstrap bg-danger/bg-warning/bg-info/bg-success ramp.
    function difficultyBadgeClass(difficulty: string) {
        switch (difficulty) {
            case 'Extreme': return 'border-destructive/30 bg-destructive/15 text-destructive';
            case 'Hard': return 'border-amber-400/30 bg-amber-400/15 text-amber-400';
            case 'Medium': return 'border-brand-blue/30 bg-brand-blue/15 text-brand-blue';
            case 'Easy': return 'border-brand-green/30 bg-brand-green/15 text-brand-green';
            default: return 'border-border bg-muted text-muted-foreground';
        }
    }

    const ratingLabel = (rating: string) =>
        `${rating}+ ⭐ (${rating === '4.0' ? 'Excellent' : rating === '3.0' ? 'Good' : rating === '2.0' ? 'Fair' : 'Any'})`;
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/overlay.css">
</svelte:head>

<!-- START OF PANEL -->
{#if showPanel}
    <div class="challenge-overlay" role="presentation" onclick={() => showPanel = false}>
        <div style="background: transparent; padding: 0; border-radius: 0;">
            {#if challengeInfo}
                <Feedback success={success} warning={warning} error={error}  />

                <div
                    role="presentation"
                    class="w-full max-w-[550px] overflow-hidden rounded-2xl border border-border bg-card! shadow-xl"
                    onclick={(e) => e.stopPropagation()}
                >
                    <!-- Header banner -->
                    <div class="flex items-start justify-between gap-3 bg-gradient-to-br from-brand-blue to-[#2e5c87] px-5 py-4">
                        <div>
                            <h5 class="mb-1 text-base font-semibold text-white!">{challengeInfo.name}</h5>
                            <p class="mb-1.5 text-xs text-white/80!">Created By: {challengeInfo.written_by}</p>
                            <div class="flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary" class="border-white/20 bg-white/15 text-white!">{challengeInfo.category}</Badge>
                                <Badge class={difficultyBadgeClass(challengeInfo.difficulty)}>{challengeInfo.difficulty}</Badge>
                            </div>
                        </div>
                        <button
                            title="Close Panel"
                            aria-label="Close panel"
                            class="rounded-md p-1 text-white/80! transition-colors hover:bg-white/10 hover:text-white!"
                            onclick={() => showPanel = false}
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>

                    <div class="p-4">
                        {#if !challengeInfo.is_active}
                            <p class="mb-2 text-sm text-amber-400">Challenge is currently Out-of-Order and will be back online soon!</p>
                        {/if}

                        {#if challengeInfo.description}
                            <p class="mb-3 text-xs text-muted-foreground">
                                {challengeInfo.description}
                            </p>
                        {/if}

                        <p class="mb-1 text-sm text-foreground">⭐ {Number(challengeInfo.rating).toFixed(1)} / 5</p>

                        <details class="mt-2 rounded-lg border border-border p-3">
                            <summary class="cursor-pointer text-xs font-medium text-muted-foreground select-none">Hints</summary>
                            <div class="mt-2 space-y-1.5">
                                {#each challengeInfo.hints as hint}
                                    <span class="block rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground">{hint}</span>
                                {/each}
                            </div>
                        </details>

                        <p class="mt-3 text-sm text-foreground">Points: {challengeInfo.points}</p>
                        <p class="text-sm text-muted-foreground">{challengeInfo.solves} Solves</p>
                    </div>

                    <!-- Footer action -->
                    <div class="border-t border-border p-4">
                        <form method="POST" action="/compete?/submit_flag" use:enhance={() => {
                            return async ({ result, update }) => {
                                await update();

                                const formResult = await handleFormResult(result);
                                success = formResult.success;
                                warning = formResult.warning;
                                error = formResult.error;

                                await invalidateAll();
                                setTimeout(clearResult, 5000);
                            };
                        }}>
                            <input type="hidden" name="cid" value={challengeInfo.id} />
                            <div class="flex gap-2">
                                <Input
                                    name="flag_value"
                                    type="text"
                                    placeholder="Enter Flag"
                                    required
                                    class="flex-1"
                                />
                                <Button type="submit">
                                    Submit
                                </Button>
                            </div>
                        </form>

                        {#if !hasRated(challengeInfo.id) && hasSolved(challengeInfo.id)}
                            <form method="POST" action="/compete?/submit_rating" use:enhance={() => {
                                return async ({ result, update }) => {
                                    await update();

                                    const formResult = await handleFormResult(result);
                                    success = formResult.success;
                                    warning = formResult.warning;
                                    error = formResult.error;

                                    await invalidateAll();
                                    setTimeout(clearResult, 5000);
                                };
                            }}>
                                <input type="hidden" name="cid" value={challengeInfo.id} />
                                <input type="hidden" name="rating" value={selectedRating} />

                                <div class="mt-3 flex items-center gap-3">
                                    <div class="flex items-center gap-1">
                                        {#each [1, 2, 3, 4, 5] as star}
                                            <button
                                                type="button"
                                                class="text-2xl leading-none transition-transform hover:scale-110 {star <= selectedRating || star <= hoveredRating ? 'text-amber-400' : 'text-muted-foreground/30'}"
                                                onmouseenter={() => hoveredRating = star}
                                                onmouseleave={() => hoveredRating = 0}
                                                onclick={() => selectedRating = star}
                                                aria-label="Rate {star} star{star !== 1 ? 's' : ''}"
                                            >
                                                ★
                                            </button>
                                        {/each}
                                    </div>

                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={selectedRating === 0}
                                    >
                                        Submit Rating
                                    </Button>
                                </div>
                            </form>
                        {/if}

                    </div>

                </div>
            {:else}
                <div class="rounded-2xl border border-border bg-card! p-4">
                    <p class="text-sm text-destructive">Error getting challenge info.</p>
                </div>
            {/if}

        </div>
    </div>
{/if}

<!-- END OF PANEL -->

<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">

    <div class="mb-6">
        <Stats progressData={ data.progressData } showAll={ false } />

        <div class="mt-4 text-center">
            <h2 class="font-mono text-2xl font-bold text-foreground">Welcome to the Gym</h2>

            <details class="mx-auto mt-2 max-w-2xl text-left">
                <summary class="cursor-pointer text-center text-sm font-light text-muted-foreground select-none">
                    What's here?
                </summary>

                <div class="mt-3 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                    <p class="mb-2">
                        The Gym is a place for practicing, learning, and improving your skills.
                    </p>

                    <p class="mb-2">
                        After events end event challenges are retired here, so you can continue solving them at your own pace.
                    </p>

                    <p class="mb-0">
                        Think of it as an archive of past KHI challenges learning and skill development.
                    </p>

                    <p class="mb-0">
                        <i>
                            If you were on a team for KHI your teams completions are not counted here, meaning this page will show you
                            what challenges you either have or have not completed.
                        </i>
                        Feel free to communicate on our Discord or view our
                        <a
                            href="https://github.com/hacksu/Kent-Hack-It-Released"
                            target="_blank"
                            class="text-brand-blue! underline underline-offset-4 hover:text-brand-green!"
                        >author's solutions</a> if you looking for help!
                    </p>
                </div>
            </details>
        </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">

        <!-- Filter Sidebar -->
        <aside class="rounded-2xl border border-border bg-card p-4 lg:h-fit">
            <h5 class="mb-3 font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">Filters</h5>

            <div class="space-y-4">

                <!-- Search -->
                <div>
                    <Label for="search-text" class="mb-1.5 block text-xs text-muted-foreground">Search</Label>
                    <Input
                        id="search-text"
                        type="text"
                        placeholder="Search challenges..."
                        bind:value={filters.searchText}
                    />
                </div>

                <!-- Category -->
                <div>
                    <Label for="catagory-search" class="mb-1.5 block text-xs text-muted-foreground">Category</Label>
                    <Select.Root type="single" bind:value={filters.category}>
                        <Select.Trigger id="catagory-search" class="w-full">
                            {filters.category || "All Categories"}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">All Categories</Select.Item>
                            {#each availableCategories as category}
                                <Select.Item value={category}>{category}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Difficulty -->
                <div>
                    <Label for="difficulty-search" class="mb-1.5 block text-xs text-muted-foreground">Difficulty</Label>
                    <Select.Root type="single" bind:value={filters.difficulty}>
                        <Select.Trigger id="difficulty-search" class="w-full">
                            {filters.difficulty || "All Difficulties"}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">All Difficulties</Select.Item>
                            {#each availableDifficulties() as difficulty}
                                <Select.Item value={difficulty}>{difficulty}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Rating -->
                <div>
                    <Label for="rating-search" class="mb-1.5 block text-xs text-muted-foreground">Minimum Rating</Label>
                    <Select.Root type="single" bind:value={filters.rating}>
                        <Select.Trigger id="rating-search" class="w-full">
                            {filters.rating ? ratingLabel(filters.rating) : "All Ratings"}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">All Ratings</Select.Item>
                            {#each availableRatings as rating}
                                <Select.Item value={rating}>{ratingLabel(rating)}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Author -->
                <div>
                    <Label for="author-search" class="mb-1.5 block text-xs text-muted-foreground">Author</Label>
                    <Select.Root type="single" bind:value={filters.author}>
                        <Select.Trigger id="author-search" class="w-full">
                            {filters.author || "All Authors"}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="">All Authors</Select.Item>
                            {#each availableAuthors as author}
                                <Select.Item value={author}>{author}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Individual Completion -->
                <div class="space-y-2">
                    <Label class="block text-xs text-muted-foreground">Individual Progress</Label>
                    <label class="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-border accent-brand-green"
                            bind:checked={filters.showCompleted}
                        />
                        My Completed
                    </label>
                    <label class="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-border accent-brand-green"
                            bind:checked={filters.showUncompleted}
                        />
                        My Uncompleted
                    </label>
                </div>

                <Button variant="outline" size="sm" class="w-full" onclick={clearFilters}>
                    Clear Filters
                </Button>

                <Separator />

                <Button
                    href="/challenge_help"
                    class="w-full bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]! hover:brightness-105"
                >
                    Challenge Help
                </Button>

            </div>
        </aside>

        <!-- Main Content -->
        <div class="flex flex-col">
            <div class="flex-1">
                {#if currentChallenges.length > 0}
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {#each currentChallenges as challenge, idx (challenge.id ?? idx)}
                            <button
                                type="button"
                                class="h-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-blue/40"
                                onclick={ () => { viewChallenge(challenge.id) } }
                            >
                                {#if !challenge.is_active}
                                    <div class="mb-3 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
                                        <TriangleAlert class="h-4.5 w-4.5 shrink-0 text-amber-400" />

                                        <div>
                                            <div class="text-sm font-semibold text-amber-300">
                                                Challenge Offline
                                            </div>

                                            <p class="text-xs text-muted-foreground">
                                                This challenge is currently out-of-order and will return soon.
                                            </p>
                                        </div>
                                    </div>
                                {/if}

                                <div class={!challenge.is_active ? 'opacity-50' : ''}>
                                    <div class="flex items-center justify-center gap-2.5">
                                        <h6 class="text-sm font-semibold text-foreground">{challenge.name}</h6>
                                    </div>

                                    <p class="mt-1 text-xs text-muted-foreground">
                                        {challenge.category} | Difficulty: {challenge.difficulty}
                                    </p>
                                    <p class="mt-0.5 text-xs text-brand-blue">
                                        By: {challenge.written_by || 'Unknown Author'}
                                    </p>
                                    {#if challenge.description}
                                        <p class="mt-2 text-xs text-muted-foreground">
                                            {challenge.description}
                                        </p>
                                    {/if}
                                    <p class="mt-2 text-xs text-foreground">⭐ {Number(challenge.rating).toFixed(1)} / 5</p>
                                    <p class="text-xs text-foreground">Points: {challenge.points}</p>
                                    <p class="text-xs text-muted-foreground">{challenge.solves} Solves</p>
                                </div>
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div class="flex min-h-[300px] items-center justify-center text-center">
                        <div>
                            <h4 class="text-lg font-medium text-muted-foreground">No challenges found</h4>
                            <p class="text-sm text-muted-foreground">Try adjusting your filters to see more challenges.</p>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Pagination -->
            <div class="mt-4 py-3">
                <div class="flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm" onclick={prevPage} disabled={currentPage === 1}>
                        ← Prev
                    </Button>
                    <span class="text-sm font-semibold text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onclick={nextPage} disabled={indexOfLast >= challenges.length}>
                        Next →
                    </Button>
                </div>
            </div>

        </div>
    </div>
    <div class="pb-5"></div>
</main>
