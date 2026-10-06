<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import AdminTabHeader from '$lib/components/admin-tab-header.svelte';
    import Panel from '$lib/components/panel.svelte';
    import UserAvatar from '$lib/components/user-avatar.svelte';
    import Search from '@lucide/svelte/icons/search';
    import Trash2 from '@lucide/svelte/icons/trash-2';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function RemoveTeam(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this team "${name}"?`)) {
            const req = await fetch('/admin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'team', action: 'delete', id: id })
            });

            const response = await req.json();

            if (response) {
                if (response.success) {
                    success = `Successfully removed ${name}`;
                } else {
                    error = `Failed to remove ${name}`;
                }
            } else {
               error = "Error Occurred";
            }

            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    interface TeamInfo {
        id: string,
        name: string,
        leader: { name: string, image: string },
        members: { name: string, image: string }[],
    };
    const { teams } = $props();

    let searchTerm = $state("");
    const filteredTeams: TeamInfo[] = $derived(
        teams.filter((team: any) => {
            return team.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );
</script>

<AdminTabHeader title="Teams" count={searchTerm ? `${filteredTeams.length} / ${teams.length}` : teams.length}>
    {#snippet actions()}
        <div class="relative min-w-0 flex-1 sm:w-64">
            <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" class="pl-8" placeholder="Search by team name…" aria-label="Search teams" bind:value={searchTerm} />
        </div>
        <Button variant="outline" size="sm" onclick={() => {}}>Force update</Button>
    {/snippet}
</AdminTabHeader>

<Feedback {success} {warning} {error} />

<Panel>
    <div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_2rem] gap-4 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground md:grid" aria-hidden="true">
        <span>Team</span><span>Leader</span><span>Members</span><span></span>
    </div>
    <ul class="divide-y divide-border">
        {#each filteredTeams as team (team.id)}
            <li class="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_2rem]">
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium" title={team.name}>{team.name}</p>
                    <p class="mt-0.5 text-xs text-muted-foreground"><span class="font-mono tabular-nums">{team.members.length + 1}</span> {team.members.length === 0 ? 'player' : 'players'}</p>
                </div>
                <div class="col-start-1 row-start-2 flex min-w-0 items-center gap-2 md:col-start-auto md:row-start-auto">
                    <UserAvatar name={team.leader.name} image={team.leader.image} class="size-7" />
                    <span class="min-w-0 truncate text-sm" title={team.leader.name}>{team.leader.name}</span>
                    <span class="text-xs text-gold md:hidden">Leader</span>
                </div>
                <div class="col-start-1 row-start-3 min-w-0 md:col-start-auto md:row-start-auto">
                    {#if team.members.length > 0}
                        <ul class="flex flex-wrap gap-x-4 gap-y-1.5">
                            {#each team.members as member}
                                <li class="flex min-w-0 max-w-full items-center gap-1.5">
                                    <UserAvatar name={member.name} image={member.image} class="size-6 text-[0.625rem]" />
                                    <span class="truncate text-xs text-muted-foreground" title={member.name}>{member.name}</span>
                                </li>
                            {/each}
                        </ul>
                    {:else}
                        <p class="text-xs text-muted-foreground">No additional members</p>
                    {/if}
                </div>
                <Button variant="ghost" size="icon-sm" class="col-start-2 row-start-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive md:col-start-auto md:row-start-auto" aria-label="Remove team {team.name}" title="Remove team {team.name}" onclick={() => { RemoveTeam(team.id, team.name) }}>
                    <Trash2 />
                </Button>
            </li>
        {:else}
            <li class="px-4 py-10 text-center text-sm text-muted-foreground">{teams.length === 0 ? 'No teams yet.' : 'No teams match your search.'}</li>
        {/each}
    </ul>
</Panel>
