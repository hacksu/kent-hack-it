<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities.js";

    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Card from "$lib/components/ui/card";
    import Crown from "@lucide/svelte/icons/crown";
    import LogOut from "@lucide/svelte/icons/log-out";

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

    const sectionLabelClass = "mb-2 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase";
    const panelHeaderClass = "border-b border-border px-4 py-3 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase";
</script>

{#if data.team}
<div class="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
    <Feedback success={success} warning={warning} error={error}  />

    <Card.Root class="overflow-hidden border border-border bg-card">
        <div class="flex items-center justify-between border-b border-border px-4 py-3">
            <span class="font-medium text-foreground">{data.team.name}</span>
            <Badge variant="secondary">{data.team.members.length + 1} / 4 members</Badge>
        </div>

        <div class="border-b border-border px-4 pt-4 pb-3">
            <p class={sectionLabelClass}>Leader</p>
            <div class="flex items-center gap-2">
                {#if data.team.leader.image}
                    <img
                        src={data.team.leader.image}
                        alt={data.team.leader.name}
                        class="h-8 w-8 rounded-full border border-border object-cover"
                        referrerpolicy="no-referrer"
                        crossorigin="anonymous"
                    />
                {:else}
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue text-xs font-medium text-[#08131f]">
                        {data.team.leader.name.slice(0, 2).toUpperCase()}
                    </div>
                {/if}
                <div>
                    <p class="text-sm font-medium text-foreground">{data.team.leader.name}</p>
                    <p class="text-xs text-muted-foreground">Team leader</p>
                </div>
                <Crown class="ml-auto h-4 w-4 text-[#BA7517]" />
            </div>
        </div>

        <div class="border-b border-border px-4 pt-4 pb-3">
            <p class={sectionLabelClass}>Members</p>
            {#if data.team.members.length === 0}
                <p class="text-sm text-muted-foreground">No other members yet.</p>
            {:else}
                <div class="flex flex-col gap-2.5">
                    {#each data.team.members as member}
                        <div class="flex items-center gap-4">
                            {#if member.image}
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    class="h-8 w-8 rounded-full border border-border object-cover"
                                    referrerpolicy="no-referrer"
                                    crossorigin="anonymous"
                                />
                            {:else}
                                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                                    {member.name.slice(0, 2).toUpperCase()}
                                </div>
                            {/if}

                            <p class="text-sm font-medium text-foreground">{member.name}</p>

                            <!-- only leader can see this -->
                            {#if data.is_leader}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    class="ml-auto"
                                    onclick={ () => { RemoveMember(member.id, member.name, data.team.id) } }
                                >
                                    Remove
                                </Button>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- only leader can see this -->
        {#if data.is_leader}
            <div class="border-b border-border px-4 pt-4 pb-3">
                <p class={sectionLabelClass}>Join Requests</p>
                {#each data.team.requests as req}
                    <div class="flex items-center gap-2 py-1">
                        {#if req.image}
                            <img
                                src={req.image}
                                alt={req.name}
                                class="h-8 w-8 rounded-full border border-border object-cover"
                                referrerpolicy="no-referrer"
                                crossorigin="anonymous"
                            />
                        {:else}
                            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                                {req.name.slice(0, 2).toUpperCase()}
                            </div>
                        {/if}

                        <p class="text-sm text-foreground">{req.name}</p>

                        <Button
                            variant="outline"
                            size="sm"
                            class="ml-auto"
                            onclick={ () => { AcceptRequest(req.id, req.checksum, req.name) } }
                        >
                            Accept
                        </Button>
                    </div>
                {/each}
            </div>
        {/if}

        <div class="flex justify-end px-4 py-3">
            <form method="POST" action="?/leave_team" use:enhance>
                <input type="hidden" name="team_id" value={data.team.id} />
                <Button type="submit" variant="outline" size="sm" class="gap-1.5">
                    <LogOut class="h-3.5 w-3.5" /> Leave team
                </Button>
            </form>
        </div>

    </Card.Root>
</div>
{:else}
<div class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
    <Feedback success={success} warning={warning} error={error}  />

    <div class="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2">

        <div class="flex flex-col border-b border-border sm:border-r sm:border-b-0">
            <div class={panelHeaderClass}>Join a team</div>
            <div class="max-h-[440px] flex-1 overflow-y-auto">
                {#each data.teams as team}
                    <div class="flex items-center justify-between border-b border-border px-4 py-2.5">
                        <span class="text-sm text-foreground">{team.name}</span>
                        <form method="POST" action="?/request_join" use:enhance={() => {
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
                            {#if team.pending}
                                <span class="text-xs text-muted-foreground">Pending</span>
                            {:else}
                                <input type="hidden" name="team_id" value={team.id} />
                                <Button variant="outline" size="sm" type="submit">
                                    Request to join
                                </Button>
                            {/if}
                        </form>
                    </div>
                {/each}
            </div>
        </div>

        <div class="flex flex-col">
            <div class={panelHeaderClass}>Create a team</div>
            <div class="flex flex-1 flex-col p-4">
                <form
                    method="POST"
                    action="?/create_team"
                    class="flex flex-1 flex-col gap-4"
                    use:enhance={() => {
                        return async ({ result, update }) => {
                            await update();

                            const formResult = await handleFormResult(result);
                            success = formResult.success;
                            warning = formResult.warning;
                            error = formResult.error;

                            await invalidateAll();
                            setTimeout(clearResult, 5000);
                        };
                    }}
                >
                    <div class="space-y-1.5">
                        <Label for="team-name" class="text-muted-foreground">Team name</Label>
                        <Input
                            type="text"
                            id="team-name"
                            name="name"
                            placeholder="Enter team name" required
                        />
                    </div>
                    <div class="mt-auto">
                        <Button
                            type="submit"
                            class="w-full bg-gradient-to-r from-brand-green to-brand-blue font-semibold text-[#08131f]! hover:brightness-105"
                        >
                            Create team
                        </Button>
                    </div>
                </form>
            </div>
        </div>

    </div>
</div>
{/if}
