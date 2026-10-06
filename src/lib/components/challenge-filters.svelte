<script lang="ts" generics="T extends { id: number; name: string; description: string; category: string; difficulty: string; written_by: string | null; rating: string | null; is_gym?: boolean | null }">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import Search from '@lucide/svelte/icons/search';
    import X from '@lucide/svelte/icons/x';
    import * as Select from '$lib/components/ui/select';

    const DIFFICULTY_ORDER = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];
    const RATING_OPTIONS = ['4.0', '3.0', '2.0', '1.0', '0.0'];

    let {
        challenges,
        filtered = $bindable([]),
        completions = undefined,
        showCompletionFilters = false,
        showTeamFilters = false,
        showGymFilter = false,
    }: {
        challenges: T[];
        filtered?: T[];
        completions?: { user?: { challenge_id: number }[] | null; team?: number[] | null };
        showCompletionFilters?: boolean;
        showTeamFilters?: boolean;
        showGymFilter?: boolean;
    } = $props();

    let filters = $state({
        category: '',
        difficulty: '',
        rating: '',
        author: '',
        searchText: '',
        gymStatus: '',
        showCompleted: true,
        showUncompleted: true,
        showTeamCompleted: true,
        showTeamUncompleted: true,
    });

    let availableCategories = $derived(
        [...new Set<string>(challenges.map((c) => c.category))].sort()
    );

    let availableDifficulties = $derived(() => {
        const unique = new Set<string>(challenges.map((c) => c.difficulty));
        return DIFFICULTY_ORDER.filter((d) => unique.has(d));
    });

    let availableAuthors = $derived(
        [...new Set<string>(
            challenges.map((c) => c.written_by).filter((a): a is string => !!a)
        )].sort()
    );

    function isCompleted(cid: number) {
        return completions?.user?.some((c) => Number(cid) === Number(c.challenge_id)) ?? false;
    }

    function isTeamCompleted(cid: number) {
        return completions?.team?.some((c) => Number(cid) === Number(c)) ?? false;
    }

    function disableUserFilters() {
        filters.showCompleted = filters.showUncompleted = false;
    }

    function disableTeamFilters() {
        filters.showTeamCompleted = filters.showTeamUncompleted = false;
    }

    function applyFilters(dataSet: T[]) {
        let result = [...dataSet];

        if (filters.category) {
            result = result.filter((c) => c.category === filters.category);
        }

        if (filters.difficulty) {
            result = result.filter((c) => c.difficulty === filters.difficulty);
        }

        if (filters.rating) {
            const threshold = parseFloat(filters.rating);
            result = result.filter((c) => Number(c.rating) >= threshold);
        }

        if (filters.author) {
            result = result.filter((c) => c.written_by === filters.author);
        }

        if (showGymFilter && filters.gymStatus) {
            result = result.filter((c) =>
                filters.gymStatus === 'gym' ? !!c.is_gym : !c.is_gym
            );
        }

        if (filters.searchText.trim()) {
            const term = filters.searchText.toLowerCase();
            result = result.filter((c) =>
                c.name?.toLowerCase().includes(term) ||
                c.category?.toLowerCase().includes(term) ||
                c.written_by?.toLowerCase().includes(term) ||
                c.description?.toLowerCase().includes(term)
            );
        }

        if (showCompletionFilters) {
            result = result.filter((c) => {
                if (showTeamFilters && (filters.showTeamCompleted || filters.showTeamUncompleted)) {
                    const teamCompleted = isTeamCompleted(c.id);
                    if (teamCompleted && !filters.showTeamCompleted) return false;
                    if (!teamCompleted && !filters.showTeamUncompleted) return false;
                } else {
                    const completed = isCompleted(c.id);
                    if (completed && !filters.showCompleted) return false;
                    if (!completed && !filters.showUncompleted) return false;
                }
                return true;
            });
        }

        return result;
    }

    $effect(() => {
        filtered = applyFilters(challenges);
    });

    function clearFilters() {
        filters = {
            category: '',
            difficulty: '',
            rating: '',
            author: '',
            searchText: '',
            gymStatus: '',
            showCompleted: true,
            showUncompleted: true,
            showTeamCompleted: true,
            showTeamUncompleted: true,
        };
    }

    const ratingLabel = (rating: string) =>
        `${rating}+ (${rating === '4.0' ? 'Excellent' : rating === '3.0' ? 'Good' : rating === '2.0' ? 'Fair' : 'Any'})`;

    const hasActiveFilters = $derived(
        !!(filters.category || filters.difficulty || filters.rating || filters.author ||
            filters.searchText.trim() || filters.gymStatus) ||
        !(filters.showCompleted && filters.showUncompleted &&
            filters.showTeamCompleted && filters.showTeamUncompleted)
    );

    const triggerClass = "w-full sm:w-auto sm:min-w-36";
    // A checkbox rendered as a toggle chip; the input stays in the DOM for keyboard and form semantics.
    const chipClass =
        "inline-flex h-7 cursor-pointer items-center rounded-full border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors select-none hover:text-foreground has-checked:border-brand-green/40 has-checked:bg-brand-green/12 has-checked:text-brand-green has-focus-visible:ring-3 has-focus-visible:ring-ring/40";
    const teamChipClass =
        "inline-flex h-7 cursor-pointer items-center rounded-full border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors select-none hover:text-foreground has-checked:border-brand-blue/40 has-checked:bg-brand-blue/12 has-checked:text-brand-blue has-focus-visible:ring-3 has-focus-visible:ring-ring/40";
</script>

<div class="rounded-xl border border-border bg-card p-3" role="search" aria-label="Filter challenges">
    <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div class="relative min-w-0 flex-1">
            <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                id="search-text"
                type="search"
                class="pl-8"
                placeholder="Search by name, category, author…"
                aria-label="Search challenges"
                bind:value={filters.searchText}
            />
        </div>

        <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Select.Root type="single" bind:value={filters.category}>
                <Select.Trigger class={triggerClass} aria-label="Category">
                    {filters.category || "All categories"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">All categories</Select.Item>
                    {#each availableCategories as category}
                        <Select.Item value={category}>{category}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            <Select.Root type="single" bind:value={filters.difficulty}>
                <Select.Trigger class={triggerClass} aria-label="Difficulty">
                    {filters.difficulty || "All difficulties"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">All difficulties</Select.Item>
                    {#each availableDifficulties() as difficulty}
                        <Select.Item value={difficulty}>{difficulty}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            <Select.Root type="single" bind:value={filters.rating}>
                <Select.Trigger class={triggerClass} aria-label="Minimum rating">
                    {filters.rating ? `Rated ${ratingLabel(filters.rating)}` : "Any rating"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">Any rating</Select.Item>
                    {#each RATING_OPTIONS as rating}
                        <Select.Item value={rating}>{ratingLabel(rating)}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            <Select.Root type="single" bind:value={filters.author}>
                <Select.Trigger class={triggerClass} aria-label="Author">
                    {filters.author || "All authors"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">All authors</Select.Item>
                    {#each availableAuthors as author}
                        <Select.Item value={author}>{author}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            {#if showGymFilter}
                <Select.Root type="single" bind:value={filters.gymStatus}>
                    <Select.Trigger class={triggerClass} aria-label="Status">
                        {filters.gymStatus === 'gym' ? 'Gym' : filters.gymStatus === 'live' ? 'Live' : 'Gym and live'}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">Gym and live</Select.Item>
                        <Select.Item value="gym">Gym</Select.Item>
                        <Select.Item value="live">Live</Select.Item>
                    </Select.Content>
                </Select.Root>
            {/if}
        </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3">
        {#if showCompletionFilters}
            <fieldset class="flex items-center gap-1.5">
                <legend class="float-left mr-1 text-xs text-muted-foreground">Mine</legend>
                <label class={chipClass}>
                    <input
                        type="checkbox"
                        class="sr-only"
                        onchange={showTeamFilters ? disableTeamFilters : undefined}
                        bind:checked={filters.showCompleted}
                    />
                    Solved
                </label>
                <label class={chipClass}>
                    <input
                        type="checkbox"
                        class="sr-only"
                        onchange={showTeamFilters ? disableTeamFilters : undefined}
                        bind:checked={filters.showUncompleted}
                    />
                    Unsolved
                </label>
            </fieldset>

            {#if showTeamFilters}
                <fieldset class="flex items-center gap-1.5">
                    <legend class="float-left mr-1 text-xs text-muted-foreground">Team</legend>
                    <label class={teamChipClass}>
                        <input
                            type="checkbox"
                            class="sr-only"
                            onchange={disableUserFilters}
                            bind:checked={filters.showTeamCompleted}
                        />
                        Solved
                    </label>
                    <label class={teamChipClass}>
                        <input
                            type="checkbox"
                            class="sr-only"
                            onchange={disableUserFilters}
                            bind:checked={filters.showTeamUncompleted}
                        />
                        Unsolved
                    </label>
                </fieldset>
            {/if}
        {/if}

        <div class="ml-auto flex items-center gap-3">
            <span class="text-xs text-muted-foreground tabular-nums" aria-live="polite">
                {filtered.length} of {challenges.length}
            </span>
            <Button variant="ghost" size="sm" onclick={clearFilters} disabled={!hasActiveFilters}>
                <X />
                Clear
            </Button>
        </div>
    </div>
</div>
