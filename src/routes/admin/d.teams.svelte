<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import * as Card from '$lib/components/ui/card';
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
                body: JSON.stringify({ context: 'team', action: 'delete', id })
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

<div>
    <!-- Search Bar -->
    <div class="mb-4">
        <div class="mb-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
                <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
                <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Active Teams</h2>
                <Badge variant="secondary">{teams.length} Team{teams.length !== 1 ? 's' : ''}</Badge>
            </div>
            <Feedback {success} {warning} {error} />
        </div>

        <div class="flex gap-2">
            <Input
                type="text"
                placeholder="Search team by name..."
                bind:value={searchTerm}
            />
            <Button class="text-nowrap" onclick={() => {}}>
                Force Update
            </Button>
        </div>
    </div>

    <!-- Team Cards -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {#each filteredTeams as team (team.id)}
            <Card.Root class="border-border bg-card p-4">
                <!-- Team Name -->
                <h4 class="mb-3 text-lg font-bold text-brand-blue">
                    {team.name}
                </h4>

                <!-- Members -->
                <h6 class="mb-2 text-xs font-semibold text-muted-foreground uppercase">Members</h6>

                <ul class="mb-3 flex flex-col gap-2 text-sm">
                    <li class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <img
                                src={team.leader.image}
                                alt="{team.leader.name}'s avatar"
                                class="h-9 w-9 rounded-full border border-border object-cover"
                                referrerpolicy="no-referrer"
                                crossorigin="anonymous"
                            />
                            <span>{team.leader.name}</span>
                        </div>
                        <Badge class="bg-amber-500/15 text-amber-500">Leader</Badge>
                    </li>

                    {#each team.members as member}
                        <li class="flex items-center gap-2">
                            <img
                                src={member.image}
                                alt="{member.name}'s avatar"
                                class="h-9 w-9 rounded-full border border-border object-cover"
                                referrerpolicy="no-referrer"
                                crossorigin="anonymous"
                            />
                            <span>{member.name}</span>
                        </li>
                    {/each}
                </ul>

                <!-- Remove Button -->
                <div class="mt-auto text-right">
                    <Button
                        variant="destructive"
                        size="sm"
                        onclick={() => { RemoveTeam(team.id, team.name) }}
                    >
                        <Trash2 class="h-3.5 w-3.5" />
                        Remove Team
                    </Button>
                </div>
            </Card.Root>
        {/each}
    </div>
</div>