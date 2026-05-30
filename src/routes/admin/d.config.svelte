<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';
    
    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities";

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    const { config } = $props();
    let activation_status = $state(config?.site_active ?? false);

    let originalStart = $state(config?.event_start ? (() => {
        const d = new Date(config.event_start);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    })() : '');
    let originalLength = $state(config?.event_length ?? 7);
    let originalActive = $state(config?.site_active ?? false);

    let currentStart  = $state(originalStart);
    let currentLength = $state(originalLength);

    let isDirty = $derived(
        currentStart !== originalStart ||
        currentLength !== originalLength ||
        activation_status !== originalActive
    );

    function resync() {
        const updated = new Date(config.event_start);
        updated.setMinutes(updated.getMinutes() - updated.getTimezoneOffset());

        currentStart  = updated.toISOString().slice(0, 16);
        currentLength = config.event_length;
        activation_status = config.site_active;

        // update the baseline so isDirty resets
        originalStart  = currentStart;
        originalLength = currentLength;
        originalActive = config.site_active;
    }
</script>

<div class="container mt-4 d-flex justify-content-center align-items-center">
    <div class="row w-100 justify-content-center">
        <h4>Configuration</h4>

        {#if !config}
            <div class="alert alert-danger d-flex align-items-center gap-2">
                <i class="ti ti-alert-circle"></i>
                Error fetching configuration!
            </div>
        {:else}
            <Feedback success={success} warning={warning} error={error} />

            {#if isDirty}
                <div class="alert alert-warning d-flex align-items-center gap-2 mb-3" style="font-size: 18px; max-width: 560px;">
                    <i class="ti ti-alert-triangle"></i>
                    You have unsaved changes — click <strong class="mx-1">Save changes</strong> to apply them.
                </div>
            {/if}

            <div class="card border rounded-3 overflow-hidden" style="max-width: 560px;" class:border-warning={isDirty}>

                <div class="card-header bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between">
                    <span class="fw-medium">Event Configuration</span>
                    <div class="d-flex align-items-center gap-2">
                        {#if isDirty}
                            <span class="badge text-bg-warning">Unsaved</span>
                        {/if}
                        <span class="badge" class:text-bg-success={activation_status} class:text-bg-secondary={!activation_status}>
                            {activation_status ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

                <div class="card-body p-3">
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

                        <div class="mb-3">
                            <label for="start-date" class="form-label small fw-medium text-muted">Event Start</label>
                            <input
                                type="datetime-local"
                                id="start-date"
                                class="form-control form-control-sm"
                                class:border-warning={currentStart !== originalStart}
                                name="start-date"
                                bind:value={currentStart}
                                required
                            />
                        </div>

                        <div class="mb-3">
                            <label for="event-length" class="form-label small fw-medium text-muted">Event Length (days)</label>
                            <input
                                type="number"
                                id="event-length"
                                class="form-control form-control-sm"
                                class:border-warning={currentLength !== originalLength}
                                name="event-length"
                                bind:value={currentLength}
                                min={1}
                                required
                            />
                        </div>

                        <input type="hidden" name="activation-status" value={activation_status ? "true" : "false"} />

                        <hr class="my-3" />

                        <div class="d-flex gap-2">
                            <button
                                type="button"
                                class="btn btn-sm w-50"
                                class:btn-outline-danger={activation_status}
                                class:btn-outline-success={!activation_status}
                                onclick={() => { activation_status = !activation_status }}
                            >
                                <i class="ti ti-power me-1"></i>
                                {activation_status ? "Disable site" : "Enable site"}
                            </button>

                            <button type="submit" class="btn btn-sm w-50"
                                class:btn-primary={isDirty}
                                class:btn-outline-secondary={!isDirty}
                                disabled={!isDirty}
                            >
                                <i class="ti ti-device-floppy me-1"></i>
                                Save changes
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        {/if}

    </div>
</div>