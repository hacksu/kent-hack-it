<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities.js";

    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import PageHeader from "$lib/components/page-header.svelte";
    import Panel from "$lib/components/panel.svelte";
    import UserAvatar from "$lib/components/user-avatar.svelte";
    import Crown from "@lucide/svelte/icons/crown";
    import LogOut from "@lucide/svelte/icons/log-out";
    import Check from "@lucide/svelte/icons/check";
    import X from "@lucide/svelte/icons/x";
    import Search from "@lucide/svelte/icons/search";
    import UserMinus from "@lucide/svelte/icons/user-minus";

    import ChallengesProgressBar from "$lib/components/challenges-progress-bar.svelte";
    import ScoreOverTimeChart from "$lib/components/team/score-over-time-chart.svelte";
    import CategoryStrengthChart from "$lib/components/category-strength-chart.svelte";
    import ContributionDonut from "$lib/components/team/contribution-donut.svelte";

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function AcceptRequest(rid: any, checksum: string, name: string) {
        if (window.confirm(`Are you sure you want to ${name} to join?`)) {
            const req = await fetch('/team?m=accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rid: rid, r_checksum: checksum })
            });

            const resp = await req.json();
            if (resp.success) {
                success = resp.message;
            } else {
                error = resp.error;
            }

            setTimeout(clearResult, 5000);
            await invalidateAll();
        }
    }

    async function DeclineRequest(rid: any, checksum: string, name: string) {
        if (window.confirm(`Decline ${name}'s request to join?`)) {
            const req = await fetch('/team?m=decline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rid: rid, r_checksum: checksum })
            });

            const resp = await req.json();
            if (resp.success) {
                success = resp.message;
            } else {
                error = resp.error;
            }

            setTimeout(clearResult, 5000);
            await invalidateAll();
        }
    }

    async function RemoveMember(uid: any, name: any, team_id: any) {
        if (window.confirm(`Are you sure you want to remove ${name}?`)) {
            const req = await fetch('/team?m=rm_member', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, name, team_id })
            });

            const resp = await req.json();
            if (resp.success) {
                success = resp.message;
            } else {
                error = resp.error;
            }

            setTimeout(clearResult, 5000);
            await invalidateAll();
        }
    }

    const { data } = $props();

    const dashboard = $derived(data.dashboard);

    let teamSearch = $state("");
    const visibleTeams = $derived(
        (data.teams ?? []).filter((team: { name: string }) =>
            team.name.toLowerCase().includes(teamSearch.trim().toLowerCase())
        )
    );

    // Shared use:enhance handler for the join / create forms.
    const submitWithFeedback = () => {
        return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
            await update();

            const formResult = await handleFormResult(result);
            success = formResult.success;
            warning = formResult.warning;
            error = formResult.error;

            await invalidateAll();
            setTimeout(clearResult, 5000);
        };
    };
</script>

{#snippet stat(label: string, value: string, suffix: string = "", accent: boolean = false)}
    <div class="rounded-xl border border-border bg-card px-4 py-3.5">
        <p class="eyebrow">{label}</p>
        <p class="mt-1 font-mono text-2xl font-semibold tabular-nums {accent ? 'text-brand-green' : 'text-foreground'}">
            {value}<span class="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>
        </p>
    </div>
{/snippet}

{#if data.team}
{@const team = data.team}
<main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Your team"
        title={team.name}
        description="{team.members.length + 1} of 4 members"
    >
        {#snippet actions()}
            <form
                method="POST"
                action="?/leave_team"
                use:enhance={({ cancel }) => {
                    if (!window.confirm(`Leave ${team.name}?`)) cancel();
                }}
            >
                <input type="hidden" name="team_id" value={team.id} />
                <Button type="submit" variant="outline">
                    <LogOut />
                    Leave team
                </Button>
            </form>
        {/snippet}
    </PageHeader>

    <Feedback success={success} warning={warning} error={error}  />

    {#if dashboard}
        <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {@render stat("Rank", dashboard.rank ? `#${dashboard.rank}` : "—", "", true)}
            {@render stat("Score", dashboard.score.toLocaleString(), "pts")}
            {@render stat("Solved", String(dashboard.solved), `/ ${dashboard.total}`)}
        </div>
    {/if}

    <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">

        <Panel title="Roster">
            <ul class="divide-y divide-border">
                <li class="flex items-center gap-3 px-4 py-3">
                    <UserAvatar name={team.leader.name} image={team.leader.image} class="size-9" />
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-foreground">{team.leader.name}</p>
                        <p class="text-xs text-muted-foreground">Team leader</p>
                    </div>
                    <Crown class="size-4 text-gold" aria-label="Leader" />
                </li>

                {#each team.members as member}
                    <li class="flex items-center gap-3 px-4 py-3">
                        <UserAvatar name={member.name} image={member.image} class="size-9" />
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-medium text-foreground">{member.name}</p>
                            <p class="text-xs text-muted-foreground">Member</p>
                        </div>

                        {#if data.is_leader}
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                class="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                                title="Remove {member.name}"
                                aria-label="Remove {member.name}"
                                onclick={ () => { RemoveMember(member.id, member.name, team.id) } }
                            >
                                <UserMinus />
                            </Button>
                        {/if}
                    </li>
                {/each}

                {#each Array(Math.max(0, 3 - team.members.length)) as _}
                    <li class="flex items-center gap-3 px-4 py-3">
                        <span class="size-9 shrink-0 rounded-full border border-dashed border-input"></span>
                        <p class="text-sm text-muted-foreground">Open slot</p>
                    </li>
                {/each}
            </ul>

            {#if data.is_leader}
                <div class="border-t border-border">
                    <div class="flex items-center justify-between px-4 pt-3 pb-1">
                        <h3 class="eyebrow">Join requests</h3>
                        {#if team.requests.length > 0}
                            <span class="rounded-full bg-brand-blue/15 px-1.5 font-mono text-xs font-medium text-brand-blue tabular-nums">
                                {team.requests.length}
                            </span>
                        {/if}
                    </div>
                    {#if team.requests.length === 0}
                        <p class="px-4 pt-1 pb-4 text-sm text-muted-foreground">No pending requests.</p>
                    {:else}
                        <ul class="pb-1">
                            {#each team.requests as req}
                                <li class="flex items-center gap-3 px-4 py-2.5">
                                    <UserAvatar name={req.name} image={req.image} />
                                    <p class="min-w-0 flex-1 truncate text-sm text-foreground">{req.name}</p>

                                    <div class="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onclick={ () => { DeclineRequest(req.id, req.checksum, req.name) } }
                                        >
                                            <X />
                                            Decline
                                        </Button>
                                        <Button
                                            size="sm"
                                            onclick={ () => { AcceptRequest(req.id, req.checksum, req.name) } }
                                        >
                                            <Check />
                                            Accept
                                        </Button>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            {/if}
        </Panel>

        <Panel title="Score over time">
            {#if dashboard}
                <ScoreOverTimeChart scoreHistory={dashboard.scoreHistory} />
                <div class="border-t border-border">
                    <ChallengesProgressBar solved={dashboard.solved} total={dashboard.total} />
                </div>
            {:else}
                <p class="px-4 py-10 text-center text-sm text-muted-foreground">No performance data yet.</p>
            {/if}
        </Panel>
    </div>

    {#if dashboard && (dashboard.categories.length > 0 || dashboard.members.length > 0)}
    <div class="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Panel title="Category strength">
            <CategoryStrengthChart categories={dashboard.categories} />
        </Panel>

        <Panel title="Who&rsquo;s carrying the team">
            <ContributionDonut members={dashboard.members} score={dashboard.score} />
        </Panel>
    </div>
    {/if}

</main>
{:else}
<main class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Team"
        title="Find your team"
        description="Join an existing team or start your own. Teams have up to 4 members, and you can also compete solo."
    />

    <Feedback success={success} warning={warning} error={error}  />

    <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">

        <Panel title="Join a team">
            <div class="border-b border-border p-3">
                <div class="relative">
                    <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        class="pl-8"
                        placeholder="Search teams…"
                        aria-label="Search teams"
                        bind:value={teamSearch}
                    />
                </div>
            </div>
            <ul class="max-h-[26rem] divide-y divide-border overflow-y-auto">
                {#each visibleTeams as team (team.id)}
                    <li class="flex items-center justify-between gap-3 px-4 py-2.5">
                        <span class="min-w-0 truncate text-sm font-medium text-foreground">{team.name}</span>
                        <form method="POST" action="?/request_join" use:enhance={submitWithFeedback}>
                            {#if team.pending}
                                <span class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Request pending</span>
                            {:else}
                                <input type="hidden" name="team_id" value={team.id} />
                                <Button variant="outline" size="sm" type="submit">
                                    Request to join
                                </Button>
                            {/if}
                        </form>
                    </li>
                {:else}
                    <li class="px-4 py-10 text-center text-sm text-muted-foreground">
                        {data.teams.length === 0 ? "No teams yet. Be the first to create one." : "No teams match your search."}
                    </li>
                {/each}
            </ul>
        </Panel>

        <Panel title="Create a team">
            <form
                method="POST"
                action="?/create_team"
                class="flex flex-col gap-4 p-4"
                use:enhance={submitWithFeedback}
            >
                <div class="space-y-1.5">
                    <Label for="team-name">Team name</Label>
                    <Input
                        type="text"
                        id="team-name"
                        name="name"
                        placeholder="Enter team name"
                        autocomplete="off"
                        required
                    />
                    <p class="text-xs text-muted-foreground">You'll be the team leader and approve who joins.</p>
                </div>
                <Button type="submit" size="lg" class="w-full">
                    Create team
                </Button>
            </form>
        </Panel>

    </div>
</main>
{/if}
