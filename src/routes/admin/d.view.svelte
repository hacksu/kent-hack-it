<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import type { ChallengeData } from '$lib/database/db';
    import type { RegistryImages } from '$lib/server/registry';

    import { Button } from '$lib/components/ui/button';
    import * as Dialog from '$lib/components/ui/dialog';
    import * as Table from '$lib/components/ui/table';
    import ChallengeFilters from '$lib/components/challenge-filters.svelte';
    import Feedback from '$lib/components/feedback.svelte';
    import Panel from '$lib/components/panel.svelte';
    import { difficultyTone } from '$lib/difficulty';
    import Pencil from '@lucide/svelte/icons/pencil';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import Power from '@lucide/svelte/icons/power';
    import FlaskConical from '@lucide/svelte/icons/flask-conical';
    import Rss from '@lucide/svelte/icons/rss';
    import Star from '@lucide/svelte/icons/star';

    let result: {
        success?:boolean,
        error?:string,
        message?:string
    } | undefined = $state(undefined);

    function clearResult() {
        result = undefined;
    }

    async function toggleChallenge(id: number, name: string, data: { is_active: boolean, is_gym: boolean }) {
        try {
            const req = await fetch('/admin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: 'challenge',
                    action: 'toggle',
                    id: id,
                    is_active: data.is_active,
                    is_gym: data.is_gym,
                })
            });

            result = await req.json();

        } catch (e: any) {
            result = {
                error: "Error Occurred!"
            };
        }

        // re-run the load in +page.server.ts updating the challenges collection
        await invalidateAll();
        setTimeout(clearResult, 5000);
    }

    async function deleteChallenge(id: number, name: string) {
        if (window.confirm(`Are you sure you want to DELETE the challenge "${name}"?`)) {
            const req = await fetch('/admin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'challenge', action: 'delete', id: id })
            });

            const json = await req.json();
            result = json.success
                ? { success: true, message: `"${name}" has been deleted` }
                : { success: false, error: json.error ?? `Failed to delete "${name}"` };

            // re-run the load in +page.server.ts updating the challenges collection
            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    import ChallengeForm from '$lib/components/challenge.form.svelte';
    let showEditPanel = $state(false);
    let originalData: ChallengeData|undefined = $state(undefined);
    function openPanel(entry: ChallengeData) { originalData = entry; showEditPanel = true; }
    function exitPanel() { showEditPanel = false; }

    const { uploaded_files, challenges = [], registry_images, form } : {
        uploaded_files: {
            archives: string[];
            bins: string[];
            jail_confs: string[];
        },
        challenges: ChallengeData[] | undefined,
        registry_images: RegistryImages,
        form: any
    } = $props();

    let filteredChallenges = $state<ChallengeData[]>([]);

    const counts = $derived({
        live: challenges.filter((c) => !c.is_gym).length,
        gym: challenges.filter((c) => c.is_gym).length,
        disabled: challenges.filter((c) => !c.is_active).length,
    });

    const headClass = "h-9 text-xs font-medium text-muted-foreground";
    const chipClass = "inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[0.6875rem] font-medium";
</script>

<!-- START OF PANEL -->

<Dialog.Root open={showEditPanel} onOpenChange={(open) => { if (!open) exitPanel(); }}>
    <Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto bg-card p-0 sm:max-w-2xl">
        <Dialog.Title class="sr-only">Edit {originalData?.name ?? "challenge"}</Dialog.Title>
        {#key `${originalData?.id}:${showEditPanel}`}
            <ChallengeForm
                title="Edit challenge"
                action_target="?/edit_challenge"
                subaction_target={undefined}
                challenge={originalData}
                onSubmit={(data: { success: boolean, message?: string, error?: string }|undefined) => {
                    showEditPanel = false;
                    if (data) {
                        result = data;
                    } else {
                        result = { error: 'An error occurred' };
                    }
                    setTimeout(clearResult, 5000);
                }}
                result={form}
                uploaded_files={uploaded_files}
                registry_images={registry_images}
                requireFlag={false}
            />
        {/key}
    </Dialog.Content>
</Dialog.Root>

<!-- END OF PANEL -->

{#snippet statusChips(challenge: ChallengeData)}
    <span class="flex flex-wrap items-center gap-1.5">
        {#if challenge.is_gym}
            <span class="{chipClass} border-brand-blue/30 bg-brand-blue/10 text-brand-blue">
                <FlaskConical class="size-3" />Gym
            </span>
        {:else}
            <span class="{chipClass} border-brand-green/30 bg-brand-green/10 text-brand-green">
                <Rss class="size-3" />Live
            </span>
        {/if}
        {#if !challenge.is_active}
            <span class="{chipClass} border-warning/30 bg-warning/10 text-warning">
                <Power class="size-3" />Disabled
            </span>
        {/if}
    </span>
{/snippet}

<div class="space-y-4">
    <!-- button fetch -->
    <Feedback
        success={result?.success ? (result.message ?? '') : ''}
        warning=""
        error={!result?.success && result?.error ? result.error : ''}
    />

    <!-- form feedback -->
    <Feedback
        success={form?.result?.success ? form.result.message : ''}
        warning=""
        error={!form?.result?.success && form?.result?.error ? form.result.error : ''}
    />

    <ChallengeFilters
        challenges={challenges}
        bind:filtered={filteredChallenges}
        showGymFilter={true}
    />

    <Panel title="Challenges">
        {#snippet actions()}
            <span class="font-mono text-xs text-muted-foreground tabular-nums">
                {counts.live} live
                <span class="px-1 text-border" aria-hidden="true">/</span>{counts.gym} gym
                <span class="px-1 text-border" aria-hidden="true">/</span>
                <span class={counts.disabled > 0 ? 'text-warning' : ''}>{counts.disabled} disabled</span>
            </span>
        {/snippet}

        <Table.Root>
            <Table.Header>
                <Table.Row class="hover:bg-transparent">
                    <Table.Head class="{headClass} w-full pl-4">Challenge</Table.Head>
                    <Table.Head class="{headClass} w-px px-4 hidden md:table-cell">Status</Table.Head>
                    <Table.Head class="{headClass} w-px px-4 hidden lg:table-cell">Category</Table.Head>
                    <Table.Head class="{headClass} w-px px-4 hidden md:table-cell">Difficulty</Table.Head>
                    <Table.Head class="{headClass} w-px px-4 hidden text-right md:table-cell">Points</Table.Head>
                    <Table.Head class="{headClass} w-px px-4 hidden text-right md:table-cell">Rating</Table.Head>
                    <Table.Head class="{headClass} w-px pr-4 text-right"><span class="sr-only">Actions</span></Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each filteredChallenges as challenge (challenge.id)}
                    {@const tone = difficultyTone(challenge.difficulty)}
                    <Table.Row>
                        <Table.Cell class="max-w-0 py-2.5 pl-4">
                            <div class="min-w-0 {challenge.is_active ? '' : 'opacity-60'}">
                                <p class="truncate text-sm font-medium text-foreground">{challenge.name}</p>
                                <p class="truncate text-xs text-muted-foreground">
                                    <span class="lg:hidden">{challenge.category}&nbsp;·&nbsp;</span>by {challenge.written_by || 'Unknown author'}
                                </p>
                            </div>
                            <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 md:hidden">
                                {@render statusChips(challenge)}
                                <span class="flex items-center gap-1.5 text-xs font-medium {tone.text}">
                                    <span class="size-1.5 rounded-full {tone.dot}"></span>{challenge.difficulty}
                                </span>
                                <span class="font-mono text-xs text-muted-foreground tabular-nums">{challenge.points} pts</span>
                                <span class="flex items-center gap-1 font-mono text-xs text-muted-foreground tabular-nums">
                                    <Star class="size-3 fill-gold text-gold" />{Number(challenge.rating).toFixed(1)}
                                </span>
                            </div>
                        </Table.Cell>
                        <Table.Cell class="hidden px-4 py-2.5 md:table-cell">
                            {@render statusChips(challenge)}
                        </Table.Cell>
                        <Table.Cell class="hidden px-4 py-2.5 text-sm text-muted-foreground lg:table-cell {challenge.is_active ? '' : 'opacity-60'}">
                            {challenge.category}
                        </Table.Cell>
                        <Table.Cell class="hidden px-4 py-2.5 md:table-cell {challenge.is_active ? '' : 'opacity-60'}">
                            <span class="flex items-center gap-1.5 text-sm font-medium {tone.text}">
                                <span class="size-1.5 rounded-full {tone.dot}"></span>{challenge.difficulty}
                            </span>
                        </Table.Cell>
                        <Table.Cell class="hidden px-4 py-2.5 text-right font-mono text-sm text-foreground tabular-nums md:table-cell {challenge.is_active ? '' : 'opacity-60'}">
                            {challenge.points}
                        </Table.Cell>
                        <Table.Cell class="hidden px-4 py-2.5 text-right md:table-cell {challenge.is_active ? '' : 'opacity-60'}">
                            <span class="inline-flex items-center gap-1 font-mono text-sm text-muted-foreground tabular-nums">
                                <Star class="size-3.5 fill-gold text-gold" />{Number(challenge.rating).toFixed(1)}
                            </span>
                        </Table.Cell>
                        <Table.Cell class="py-2.5 pr-3 text-right align-top md:align-middle">
                            <div class="grid grid-cols-[repeat(2,1.75rem)] gap-0.5 md:flex md:items-center md:justify-end">
                                <!-- Enable / Disable -->
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    class="text-muted-foreground"
                                    aria-label="{challenge.is_active ? 'Disable' : 'Enable'} {challenge.name}"
                                    title={challenge.is_active ? 'Disable' : 'Enable'}
                                    onclick={() => { toggleChallenge(challenge.id, challenge.name, { is_active: !challenge.is_active, is_gym: challenge.is_gym ?? false }) }}
                                >
                                    <Power />
                                </Button>

                                <!-- Is Live / Is Gym -->
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    class="text-muted-foreground"
                                    aria-label="{challenge.is_gym ? 'Set live' : 'Set gym'}: {challenge.name}"
                                    title={challenge.is_gym ? 'Set live' : 'Set gym'}
                                    onclick={() => { toggleChallenge(challenge.id, challenge.name, { is_active: challenge.is_active ?? false, is_gym: !challenge.is_gym }) }}
                                >
                                    {#if challenge.is_gym}
                                        <Rss />
                                    {:else}
                                        <FlaskConical />
                                    {/if}
                                </Button>

                                <span class="mx-1 hidden h-4 w-px bg-border md:block" aria-hidden="true"></span>

                                <!-- Edit / Delete -->
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Edit {challenge.name}"
                                    title="Edit"
                                    onclick={() => { openPanel(challenge) }}
                                >
                                    <Pencil />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    class="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                                    aria-label="Delete {challenge.name}"
                                    title="Delete"
                                    onclick={() => { deleteChallenge(challenge.id, challenge.name) }}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        </Table.Cell>
                    </Table.Row>
                {:else}
                    <Table.Row class="hover:bg-transparent">
                        <Table.Cell colspan={7} class="py-10 text-center text-sm text-muted-foreground">
                            {challenges.length === 0 ? "No challenges yet. Add one from the Create tab." : "No challenges match your filters."}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </Panel>
</div>
