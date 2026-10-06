<script lang="ts">
    import { Badge } from '$lib/components/ui/badge';
    import Panel from '$lib/components/panel.svelte';
    import AdminTabHeader from '$lib/components/admin-tab-header.svelte';
    import UserAvatar from '$lib/components/user-avatar.svelte';
    import { difficultyTone } from '$lib/difficulty';
    import Star from '@lucide/svelte/icons/star';
    import ChallengeFilters from '$lib/components/challenge-filters.svelte';

    const { solvers, challenges } = $props();

    let filteredChallenges = $state<typeof challenges>([]);

</script>

<AdminTabHeader title="Challenge solvers" count={`${filteredChallenges.length} / ${challenges.length}`} />

<div class="space-y-4">
    <ChallengeFilters challenges={challenges} bind:filtered={filteredChallenges} showGymFilter={true} />

    <div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each filteredChallenges as challenge (challenge.id)}
            {@const challengeSolvers = solvers[challenge.id] ?? []}
            <Panel>
                <div class="space-y-2 border-b border-border p-4">
                    <div class="flex min-w-0 items-start justify-between gap-2">
                        <h3 class="min-w-0 truncate text-sm font-semibold" title={challenge.name}>{challenge.name}</h3>
                        <Badge variant="outline" class={difficultyTone(challenge.difficulty).badge}>{challenge.difficulty}</Badge>
                    </div>
                    <p class="truncate text-xs text-muted-foreground" title={challenge.written_by ?? 'Unknown author'}>By {challenge.written_by ?? 'Unknown author'}</p>
                    <div class="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span class="min-w-0 truncate">{challenge.category}</span>
                        <span class="flex shrink-0 items-center gap-1 font-mono tabular-nums">
                            <Star class="size-3 fill-gold text-gold" aria-label="Rating" />
                            {Number(challenge.rating ?? 0).toFixed(1)}
                        </span>
                    </div>
                </div>
                <div class="flex items-center justify-between px-4 pt-3 pb-1">
                    <p class="eyebrow">Solvers</p>
                    <span class="font-mono text-xs text-muted-foreground tabular-nums">{challengeSolvers.length}</span>
                </div>
                <ol class="max-h-64 overflow-y-auto px-4 pb-3">
                    {#each challengeSolvers as username, index}
                        <li class="flex items-center gap-2 py-1.5">
                            <span class="w-5 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                            <UserAvatar name={username} class="size-6 text-[0.625rem]" />
                            <span class="min-w-0 truncate text-sm" title={username}>{username}</span>
                        </li>
                    {:else}
                        <li class="py-3 text-sm text-muted-foreground">No solvers yet.</li>
                    {/each}
                </ol>
            </Panel>
        {:else}
            <Panel class="sm:col-span-2 xl:col-span-3">
                <p class="px-4 py-10 text-center text-sm text-muted-foreground">{challenges.length === 0 ? 'No challenges yet.' : 'No challenges match your filters.'}</p>
            </Panel>
        {/each}
    </div>
</div>
