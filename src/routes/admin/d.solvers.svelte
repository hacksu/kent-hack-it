<script lang="ts">
    import { Badge } from '$lib/components/ui/badge';
    import * as Card from '$lib/components/ui/card';
    import ChallengeFilters from '$lib/components/challenge-filters.svelte';

    const { solvers, challenges } = $props();

    let filteredChallenges = $state<typeof challenges>([]);

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
        <ChallengeFilters
            challenges={challenges}
            bind:filtered={filteredChallenges}
            showGymFilter={true}
        />
    </div>

    <!-- Challenge Cards -->
    <div class="flex-1">
        {#if filteredChallenges.length === 0}
            <div class="py-16 text-center">
                <p class="text-muted-foreground">No challenges found</p>
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
