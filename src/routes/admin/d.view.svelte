<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import type { ChallengeData } from '$lib/database/db';
    import type { RegistryImages } from '$lib/server/registry';

    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import * as Card from '$lib/components/ui/card';
    import * as Dialog from '$lib/components/ui/dialog';
    import Pencil from '@lucide/svelte/icons/pencil';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import Power from '@lucide/svelte/icons/power';
    import FlaskConical from '@lucide/svelte/icons/flask-conical';
    import Rss from '@lucide/svelte/icons/rss';

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
                    id,
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
                body: JSON.stringify({ context: 'challenge', action: 'delete', id })
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
</script>

<!-- START OF PANEL -->

<Dialog.Root open={showEditPanel} onOpenChange={(open) => { if (!open) exitPanel(); }}>
    <Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto bg-card p-0 sm:max-w-2xl">
        {#key `${originalData?.id}:${showEditPanel}`}
            <ChallengeForm
                title="Edit Challenge"
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

<div>
    <!-- button fetch -->
    {#if result?.success}
        <div class="mx-auto mb-3 max-w-[37.5rem] rounded-lg border border-brand-green/40 bg-brand-green/10 px-3 py-2.5 text-center text-sm text-foreground">
            {result.message}
        </div>
    {:else if result?.error}
        <div class="mx-auto mb-3 max-w-[37.5rem] rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
            {result.error}
        </div>
    {/if}

    <!-- form feedback -->
    {#if form?.result?.success}
        <div class="mx-auto mb-3 max-w-[37.5rem] rounded-lg border border-brand-green/40 bg-brand-green/10 px-3 py-2.5 text-center text-sm text-foreground">
            {form.result.message}
        </div>
    {:else if form?.result?.error}
        <div class="mx-auto mb-3 max-w-[37.5rem] rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
            {form.result.error}
        </div>
    {/if}

    <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Current Challenges</h2>
        </div>
        <Badge variant="secondary">
            {challenges.length} Challenge{challenges.length !== 1 ? 's' : ''}
        </Badge>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each challenges as challenge}
            <Card.Root class="gap-2 border-border bg-card p-3">

                <div class="flex items-center justify-between gap-2">
                    <!-- Enable / Disable -->
                    <Button
                        variant="outline"
                        size="sm"
                        class={challenge.is_active ? 'border-destructive/40 text-destructive hover:bg-destructive/10' : 'border-brand-green/40 text-brand-green hover:bg-brand-green/10'}
                        onclick={() => { toggleChallenge(challenge.id, challenge.name, { is_active: !challenge.is_active, is_gym: challenge.is_gym ?? false }) }}
                    >
                        <Power class="h-3.5 w-3.5" />
                        {challenge.is_active ? 'Disable' : 'Enable'}
                    </Button>

                    <!-- Is Live / Is Gym -->
                    <Button
                        variant="outline"
                        size="sm"
                        class={challenge.is_gym ? 'text-muted-foreground' : 'border-brand-blue/40 text-brand-blue hover:bg-brand-blue/10'}
                        onclick={() => { toggleChallenge(challenge.id, challenge.name, { is_active: challenge.is_active ?? false, is_gym: !challenge.is_gym }) }}
                    >
                        {#if challenge.is_gym}
                            <Rss class="h-3.5 w-3.5" />
                        {:else}
                            <FlaskConical class="h-3.5 w-3.5" />
                        {/if}
                        {challenge.is_gym ? 'Set Live' : 'Set Gym'}
                    </Button>
                </div>

                <!-- Challenge Info -->
                <div>
                    <h6 class="mb-1 font-semibold text-foreground">{challenge.name}</h6>
                    <p class="text-xs text-muted-foreground">
                        {challenge.category} | Difficulty: {challenge.difficulty}
                    </p>

                    <p class="mt-1 text-xs text-brand-blue">
                        By: {challenge.written_by || 'Unknown Author'}
                    </p>

                    <p class="mt-2 text-xs text-muted-foreground">
                        ⭐ {Number(challenge.rating).toFixed(1)} / 5
                    </p>

                    <p class="text-xs text-muted-foreground">
                        Points: {challenge.points}
                    </p>
                </div>

                <!-- Edit / Delete -->
                <div class="flex items-center justify-between gap-2 pt-1">
                    <Button variant="outline" size="sm" onclick={() => { openPanel(challenge) }}>
                        <Pencil class="h-3.5 w-3.5" />
                        Edit
                    </Button>

                    <Button variant="destructive" size="sm" onclick={() => { deleteChallenge(challenge.id, challenge.name) }}>
                        <Trash2 class="h-3.5 w-3.5" />
                        Delete
                    </Button>
                </div>

            </Card.Root>
        {/each}
    </div>
</div>