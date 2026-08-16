<script lang="ts" generics="T extends { id: number; name: string; description: string; category: string; difficulty: string; written_by: string | null; rating: string | null; is_gym?: boolean | null }">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Separator } from '$lib/components/ui/separator';
    import * as Select from '$lib/components/ui/select';

    const DIFFICULTY_ORDER = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];
    const RATING_OPTIONS = ['4.0', '3.0', '2.0', '1.0', '0.0'];

    let {
        challenges,
        filtered = $bindable([]),
        completions = undefined,
        showCompletionFilters = false,
        showTeamFilters = false,
        showHelpButton = false,
        showGymFilter = false,
    }: {
        challenges: T[];
        filtered?: T[];
        completions?: { user?: { challenge_id: number }[] | null; team?: number[] | null };
        showCompletionFilters?: boolean;
        showTeamFilters?: boolean;
        showHelpButton?: boolean;
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
        `${rating}+ ⭐ (${rating === '4.0' ? 'Excellent' : rating === '3.0' ? 'Good' : rating === '2.0' ? 'Fair' : 'Any'})`;
</script>

<aside class="rounded-2xl border border-border bg-card p-4 lg:h-fit">
    <h5 class="mb-3 font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">Filters</h5>

    <div class="space-y-4">

        <div>
            <Label for="search-text" class="mb-1.5 block text-xs text-muted-foreground">Search</Label>
            <Input
                id="search-text"
                type="text"
                placeholder="Search challenges..."
                bind:value={filters.searchText}
            />
        </div>

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

        <div>
            <Label for="rating-search" class="mb-1.5 block text-xs text-muted-foreground">Minimum Rating</Label>
            <Select.Root type="single" bind:value={filters.rating}>
                <Select.Trigger id="rating-search" class="w-full">
                    {filters.rating ? ratingLabel(filters.rating) : "All Ratings"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="">All Ratings</Select.Item>
                    {#each RATING_OPTIONS as rating}
                        <Select.Item value={rating}>{ratingLabel(rating)}</Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>

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

        {#if showGymFilter}
            <div>
                <Label for="gym-status-search" class="mb-1.5 block text-xs text-muted-foreground">Status</Label>
                <Select.Root type="single" bind:value={filters.gymStatus}>
                    <Select.Trigger id="gym-status-search" class="w-full">
                        {filters.gymStatus === 'gym' ? 'Gym' : filters.gymStatus === 'live' ? 'Live' : 'All'}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">All</Select.Item>
                        <Select.Item value="gym">Gym</Select.Item>
                        <Select.Item value="live">Live</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
        {/if}

        {#if showCompletionFilters}
            <div class="space-y-2">
                <Label class="block text-xs text-muted-foreground">Individual Progress</Label>
                <label class="flex items-center gap-2 text-sm text-foreground">
                    <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-border accent-brand-green"
                        onchange={showTeamFilters ? disableTeamFilters : undefined}
                        bind:checked={filters.showCompleted}
                    />
                    My Completed
                </label>
                <label class="flex items-center gap-2 text-sm text-foreground">
                    <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-border accent-brand-green"
                        onchange={showTeamFilters ? disableTeamFilters : undefined}
                        bind:checked={filters.showUncompleted}
                    />
                    My Uncompleted
                </label>
            </div>

            {#if showTeamFilters}
                <div class="space-y-2">
                    <Label class="block text-xs text-muted-foreground">Team Progress</Label>
                    <label class="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-border accent-brand-blue"
                            onchange={disableUserFilters}
                            bind:checked={filters.showTeamCompleted}
                        />
                        Team Completed
                    </label>
                    <label class="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            class="h-4 w-4 rounded border-border accent-brand-blue"
                            onchange={disableUserFilters}
                            bind:checked={filters.showTeamUncompleted}
                        />
                        Team Uncompleted
                    </label>
                </div>
            {/if}
        {/if}

        <Button variant="outline" size="sm" class="w-full" onclick={clearFilters}>
            Clear Filters
        </Button>

        {#if showHelpButton}
            <Separator />

            <Button
                href="/challenge_help"
                class="w-full bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]! hover:brightness-105"
            >
                Challenge Help
            </Button>
        {/if}

    </div>
</aside>
