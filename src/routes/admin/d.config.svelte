<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';
    import { untrack } from 'svelte';

    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities";
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Badge } from '$lib/components/ui/badge';
    import * as Card from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';
    import Power from '@lucide/svelte/icons/power';
    import Save from '@lucide/svelte/icons/save';
    import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
    import CircleAlert from '@lucide/svelte/icons/circle-alert';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    const { config } = $props();

    let event_status = $state(untrack(() => config?.event_active ?? false));
    let gym_status = $state(untrack(() => config?.gym_active ?? false));

    let originalStart = $state(untrack(() => config?.event_start ? (() => {
        const d = new Date(config.event_start);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    })() : ''));
    let originalLength = $state(untrack(() => config?.event_length ?? 7));

    let originalEventActive = $state(untrack(() => config?.event_active ?? false));
    let originalGymActive = $state(untrack(() => config?.gym_active ?? false));

    let currentStart  = $state(untrack(() => originalStart));
    let currentLength = $state(untrack(() => originalLength));

    let isDirty = $derived(
        currentStart !== originalStart ||
        currentLength !== originalLength ||
        event_status !== originalEventActive ||
        gym_status !== originalGymActive
    );

    function resync() {
        const updated = new Date(config.event_start);
        updated.setMinutes(updated.getMinutes() - updated.getTimezoneOffset());

        event_status = originalEventActive = config.event_active;
        gym_status = originalGymActive = config.gym_active;

        currentStart  = updated.toISOString().slice(0, 16);
        currentLength = config.event_length;

        // update the baseline so isDirty resets
        originalStart  = currentStart;
        originalLength = currentLength;

        console.log(config);
    }
</script>

<div>
    <div class="mb-4 flex items-center gap-2.5">
        <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
        <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Configuration</h2>
    </div>

    {#if !config}
        <div class="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <CircleAlert class="h-4 w-4 shrink-0" />
            Error fetching configuration!
        </div>
    {:else}
        <Feedback {success} {warning} {error} />

        {#if isDirty}
            <div class="mx-auto mb-4 flex max-w-[35rem] items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-500">
                <TriangleAlert class="h-4 w-4 shrink-0" />
                You have unsaved changes &mdash; click <strong class="mx-1">Save changes</strong> to apply them.
            </div>
        {/if}

        <Card.Root class="mx-auto max-w-[35rem] border-border bg-card {isDirty ? 'border-amber-500/50' : ''}">
            <Card.Header class="flex-row items-center justify-between space-y-0 border-b border-border pb-3">
                <Card.Title class="text-sm font-medium">Event Configuration</Card.Title>
                <div class="flex items-center gap-2">
                    {#if isDirty}
                        <Badge class="bg-amber-500/15 text-amber-500">Unsaved</Badge>
                    {/if}
                    <Badge variant={event_status ? 'default' : 'secondary'}>
                        Event: {event_status ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={gym_status ? 'default' : 'secondary'}>
                        Gym: {gym_status ? "Active" : "Inactive"}
                    </Badge>
                </div>
            </Card.Header>

            <Card.Content class="pt-4">
                <form method="POST" action="?/update_config" use:enhance={() => {
                    return async ({ result, update }) => {
                        await update();

                        const formResult = await handleFormResult(result);
                        success = formResult.success;
                        warning = formResult.warning;
                        error = formResult.error;

                        if (result.type === 'success' && result.data) {
                            await invalidateAll();
                            resync();
                            setTimeout(clearResult, 5000);
                        }
                    };
                }}>

                    <div class="mb-3 flex flex-col gap-1.5">
                        <Label for="start-date" class="text-xs font-medium text-muted-foreground">Event Start</Label>
                        <Input
                            type="datetime-local"
                            id="start-date"
                            class={currentStart !== originalStart ? 'border-amber-500/60' : ''}
                            name="start-date"
                            bind:value={currentStart}
                            required
                        />
                    </div>

                    <div class="mb-3 flex flex-col gap-1.5">
                        <Label for="event-length" class="text-xs font-medium text-muted-foreground">Event Length (days)</Label>
                        <Input
                            type="number"
                            id="event-length"
                            class={currentLength !== originalLength ? 'border-amber-500/60' : ''}
                            name="event-length"
                            bind:value={currentLength}
                            min={1}
                            required
                        />
                    </div>

                    <input type="hidden" name="event-status" value={event_status ? "true" : "false"} />
                    <input type="hidden" name="gym-status" value={gym_status ? "true" : "false"} />

                    <Separator class="my-3" />

                    <div class="flex gap-2">
                        <Button
                            type="button"
                            variant={event_status ? 'default' : 'outline'}
                            class="w-1/2"
                            onclick={() => { event_status = !event_status }}
                        >
                            <Power class="h-3.5 w-3.5" />
                            {event_status ? "Disable Event" : "Enable Event"}
                        </Button>

                        <Button
                            type="button"
                            variant={gym_status ? 'default' : 'outline'}
                            class="w-1/2"
                            onclick={() => { gym_status = !gym_status }}
                        >
                            <Power class="h-3.5 w-3.5" />
                            {gym_status ? "Disable Gym" : "Enable Gym"}
                        </Button>
                    </div>

                    <Button
                        type="submit"
                        variant={isDirty ? 'default' : 'outline'}
                        class="mt-2 w-full"
                        disabled={!isDirty}
                    >
                        <Save class="h-3.5 w-3.5" />
                        Save changes
                    </Button>

                </form>
            </Card.Content>
        </Card.Root>
    {/if}

</div>