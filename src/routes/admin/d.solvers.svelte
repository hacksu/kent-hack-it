<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import * as Card from '$lib/components/ui/card';
    import * as Select from '$lib/components/ui/select';

    const { solvers, challenges } = $props();

    const difficultyOrder = ['Simple', 'Easy', 'Medium', 'Hard', 'Extreme'];

    let filters = $state({
        search: '',
        category: '',
        difficulty: '',
        author: '',
        rating: '',
    });

    let availableCategories = $derived([...new Set(challenges.map(
        (c: any) => c.category as string))].sort());
    let availableDifficulties = $derived(difficultyOrder.filter(d => challenges.some(
        (c: any) => c.difficulty === d)));
    let availableAuthors = $derived([...new Set(challenges.map(
        (c: any) => c.written_by).filter(Boolean))].sort() as string[]);
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
            'Extreme': 'bg-destructive/15 text-destructive',
            'Hard': 'bg-amber-500/15 text-amber-500',
            'Medium': 'bg-brand-blue/15 text-brand-blue',
            'Easy': 'bg-brand-green/15 text-brand-green',
            'Simple': 'bg-muted text-muted-foreground',
        }[difficulty] ?? 'bg-secondary text-secondary-foreground';
    }
</script>

<div class="flex flex-col gap-4 lg:flex-row">

    <!-- Filter Sidebar -->
    <div class="lg:w-64 lg:shrink-0">
        <Card.Root class="border-border bg-card p-4">
            <h3 class="mb-3 text-center font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">Filters</h3>

            <div class="mb-3 flex flex-col gap-1.5">
                <Label for="search-filter" class="text-xs font-medium text-muted-foreground">Search</Label>
                <Input id="search-filter" type="text" placeholder="Name, author..." bind:value={filters.search} />
            </div>

            <div class="mb-3 flex flex-col gap-1.5">
                <Label class="text-xs font-medium text-muted-foreground">Category</Label>
                <Select.Root type="single" bind:value={filters.category}>
                    <Select.Trigger class="w-full">
                        {filters.category || 'All Categories'}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">All Categories</Select.Item>
                        {#each availableCategories as cat}
                            <Select.Item value={cat as string}>{cat}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="mb-3 flex flex-col gap-1.5">
                <Label class="text-xs font-medium text-muted-foreground">Difficulty</Label>
                <Select.Root type="single" bind:value={filters.difficulty}>
                    <Select.Trigger class="w-full">
                        {filters.difficulty || 'All Difficulties'}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">All Difficulties</Select.Item>
                        {#each availableDifficulties as diff}
                            <Select.Item value={diff}>{diff}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="mb-3 flex flex-col gap-1.5">
                <Label class="text-xs font-medium text-muted-foreground">Author</Label>
                <Select.Root type="single" bind:value={filters.author}>
                    <Select.Trigger class="w-full">
                        {filters.author || 'All Authors'}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">All Authors</Select.Item>
                        {#each availableAuthors as author}
                            <Select.Item value={author}>{author}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="mb-3 flex flex-col gap-1.5">
                <Label class="text-xs font-medium text-muted-foreground">Minimum Rating</Label>
                <Select.Root type="single" bind:value={filters.rating}>
                    <Select.Trigger class="w-full">
                        {filters.rating ? `${filters.rating}+ ⭐` : 'All Ratings'}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="">All Ratings</Select.Item>
                        {#each availableRatings as r}
                            <Select.Item value={r}>{r}+ ⭐</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <Button variant="outline" size="sm" class="w-full" onclick={clearFilters}>
                Clear Filters
            </Button>
        </Card.Root>
    </div>

    <!-- Challenge Cards -->
    <div class="flex-1">
        {#if filteredChallenges.length === 0}
            <div class="py-16 text-center">
                <p class="text-muted-foreground">No challenges found</p>
                <Button variant="outline" size="sm" class="mt-2" onclick={clearFilters}>Clear Filters</Button>
            </div>
        {:else}
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {#each filteredChallenges as challenge (challenge.id)}
                    {@const challengeSolvers = solvers[challenge.id] ?? []}
                    <Card.Root class="gap-0 overflow-hidden border-border bg-card py-0">
                        <div class="flex items-center justify-between gap-2 bg-gradient-to-r from-brand-blue/25 to-brand-blue/10 px-3 py-2">
                            <span class="truncate text-sm font-medium text-foreground">{challenge.name}</span>
                            <Badge class={difficultyClass(challenge.difficulty)}>{challenge.difficulty}</Badge>
                        </div>

                        <div class="flex flex-1 flex-col p-3">
                            <p class="mb-1 text-xs text-muted-foreground">
                                By {challenge.written_by ?? 'Unknown'}
                            </p>
                            <p class="mb-2 text-xs text-muted-foreground">
                                {challenge.category}
                                &nbsp;|&nbsp;
                                ⭐ {Number(challenge.rating ?? 0).toFixed(1)}
                            </p>

                            <div class="mb-2 flex items-center gap-2">
                                <Badge variant="secondary">{challengeSolvers.length} solve{challengeSolvers.length !== 1 ? 's' : ''}</Badge>
                            </div>

                            {#if challengeSolvers.length > 0}
                                <ol class="flex-1 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                                    {#each challengeSolvers as username}
                                        <li>{username}</li>
                                    {/each}
                                </ol>
                            {:else}
                                <p class="mt-auto text-xs text-muted-foreground italic">No solvers yet</p>
                            {/if}
                        </div>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </div>

</div>
