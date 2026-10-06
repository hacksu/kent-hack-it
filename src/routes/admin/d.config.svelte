<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';
    import { untrack } from 'svelte';

    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities";
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import AdminTabHeader from '$lib/components/admin-tab-header.svelte';
    import Panel from '$lib/components/panel.svelte';
    import { Separator } from '$lib/components/ui/separator';
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

<div class="mx-auto w-full max-w-xl">
    <AdminTabHeader title="Configuration" />

    {#if !config}
        <div class="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <CircleAlert class="h-4 w-4 shrink-0" />
            Error fetching configuration!
        </div>
    {:else}
        <Feedback {success} {warning} {error} />

        {#if isDirty}
            <div class="mb-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                <TriangleAlert class="h-4 w-4 shrink-0" />
                <span>You have unsaved changes. Save to apply them.</span>
            </div>
        {/if}

        <Panel class={isDirty ? 'border-warning/50' : ''}>
            <div class="p-4 sm:p-5">
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
                        <Label for="start-date" class="text-xs font-medium text-muted-foreground">Event start</Label>
                        <Input
                            type="datetime-local"
                            id="start-date"
                            class={currentStart !== originalStart ? 'border-warning/60' : ''}
                            name="start-date"
                            bind:value={currentStart}
                            required
                        />
                    </div>

                    <div class="mb-3 flex flex-col gap-1.5">
                        <Label for="event-length" class="text-xs font-medium text-muted-foreground">Event length (days)</Label>
                        <Input
                            type="number"
                            id="event-length"
                            class={currentLength !== originalLength ? 'border-warning/60' : ''}
                            name="event-length"
                            bind:value={currentLength}
                            min={1}
                            required
                        />
                    </div>

                    <input type="hidden" name="event-status" value={event_status ? "true" : "false"} />
                    <input type="hidden" name="gym-status" value={gym_status ? "true" : "false"} />

                    <Separator class="my-3" />

                    <div class="space-y-4 py-1">
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <p id="event-state-label" class="text-sm font-medium">Event</p>
                                <p class="mt-0.5 text-xs text-muted-foreground">Competition access</p>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="text-sm {event_status ? 'text-brand-green' : 'text-muted-foreground'}">{event_status ? 'On' : 'Off'}</span>
                                <button type="button" role="switch" aria-checked={event_status} aria-labelledby="event-state-label" class="relative h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 {event_status ? 'bg-primary' : 'bg-input'}" onclick={() => { event_status = !event_status }}>
                                    <span class="absolute top-0.5 left-0.5 size-5 rounded-full bg-background transition-transform {event_status ? 'translate-x-5' : ''}"></span>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <div>
                                <p id="gym-state-label" class="text-sm font-medium">Gym</p>
                                <p class="mt-0.5 text-xs text-muted-foreground">Practice challenge access</p>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="text-sm {gym_status ? 'text-brand-green' : 'text-muted-foreground'}">{gym_status ? 'On' : 'Off'}</span>
                                <button type="button" role="switch" aria-checked={gym_status} aria-labelledby="gym-state-label" class="relative h-6 w-11 shrink-0 rounded-full border border-transparent transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 {gym_status ? 'bg-primary' : 'bg-input'}" onclick={() => { gym_status = !gym_status }}>
                                    <span class="absolute top-0.5 left-0.5 size-5 rounded-full bg-background transition-transform {gym_status ? 'translate-x-5' : ''}"></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant={isDirty ? 'default' : 'outline'}
                        class="mt-5 w-full"
                        disabled={!isDirty}
                    >
                        <Save />
                        Save changes
                    </Button>

                </form>
            </div>
        </Panel>
    {/if}

</div>