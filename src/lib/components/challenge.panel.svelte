<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";

    import Feedback from "$lib/components/feedback.svelte";

    import { type ViewableChallengeData } from "$lib/database/db.js";
    import { handleFormResult } from "$lib/utilities.js";

    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import X from "@lucide/svelte/icons/x";

    let {
        challengeInfo,
        showPanel = $bindable(false),
        success = $bindable(""),
        warning = $bindable(""),
        error = $bindable(""),
        instance_infomation,
        instanceLabel,
        timeLeft,
        otherInstanceActive,
        ssh_active,
        ssh_command,
        ssh_password,
        sshTimeLeft,
        web_active,
        web_url,
        hasRated,
        hasSolved,
        difficultyBadgeClass,
        clearResult,
        onViewChallenge
    }: {
        challengeInfo: ViewableChallengeData | undefined;
        showPanel: boolean;
        success: string;
        warning: string;
        error: string;
        instance_infomation: string;
        instanceLabel: string;
        timeLeft: string;
        otherInstanceActive: boolean;
        ssh_active: boolean;
        ssh_command: string;
        ssh_password: string;
        sshTimeLeft: string;
        web_active: boolean;
        web_url: string;
        hasRated: (cid: number) => boolean;
        hasSolved: (cid: number) => boolean;
        difficultyBadgeClass: (difficulty: string) => string;
        clearResult: () => void;
        onViewChallenge: (cid: string | number) => void;
    } = $props();

    // Local to the panel: reset naturally each time a new challenge is viewed
    // since the component's rating form is only ever shown while a panel is open.
    let selectedRating = $state(0);
    let hoveredRating = $state(0);
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/overlay.css">
</svelte:head>

{#if showPanel}
    <div class="challenge-overlay" role="presentation" onclick={() => showPanel = false}>
        <div style="background: transparent; padding: 0; border-radius: 0;">
            {#if challengeInfo}
                <Feedback success={success} warning={warning} error={error} />

                <div
                    role="presentation"
                    class="w-full max-w-[550px] overflow-hidden rounded-2xl border border-border bg-card! shadow-xl"
                    onclick={(e) => e.stopPropagation()}
                >
                    <!-- Header banner -->
                    <div class="flex items-start justify-between gap-3 bg-gradient-to-br from-brand-blue to-[#2e5c87] px-5 py-4">
                        <div>
                            <h5 class="mb-1 text-base font-semibold text-white!">{challengeInfo.name}</h5>
                            <p class="mb-1.5 text-xs text-white/80!">Created By: {challengeInfo.written_by}</p>
                            <div class="flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary" class="border-white/20 bg-white/15 text-white!">{challengeInfo.category}</Badge>
                                <Badge class={difficultyBadgeClass(challengeInfo.difficulty)}>{challengeInfo.difficulty}</Badge>
                            </div>
                        </div>
                        <button
                            title="Close Panel"
                            aria-label="Close panel"
                            class="rounded-md p-1 text-white/80! transition-colors hover:bg-white/10 hover:text-white!"
                            onclick={() => showPanel = false}
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>

                    <div class="p-4">
                        {#if !challengeInfo.is_active}
                            <p class="mb-2 text-sm text-amber-400">Challenge is currently Out-of-Order and will be back online soon!</p>
                        {/if}

                        {#if challengeInfo.description}
                            <p class="mb-3 text-xs text-muted-foreground">
                                {challengeInfo.description}
                            </p>
                        {/if}

                        {#if challengeInfo.hlinks != null && challengeInfo.hlinks.length > 0}
                            <p class="mb-1 text-sm text-foreground">Challenge Files:</p>
                            {#each challengeInfo.hlinks ?? [] as hlink}
                                <a
                                    href={`/api/download/${hlink}?t=archive`}
                                    class="mb-1 block text-xs text-brand-blue! underline underline-offset-4 hover:text-brand-green!"
                                >
                                    {hlink}
                                </a>
                            {/each}
                        {/if}

                        {#if instance_infomation.length === 0}
                            {#if challengeInfo && (challengeInfo.nsjail_conf != null && challengeInfo.nsjail_conf.length > 0)}
                                {@const cid = challengeInfo.id}
                                <form method="POST" action="?/create_instance" use:enhance={({ cancel }) => {
                                    if (otherInstanceActive && !window.confirm("You have another active instance running elsewhere. Launching this instance will end it and any progress will be lost. Continue?")) {
                                        cancel();
                                        return;
                                    }
                                    return async ({ result, update }) => {
                                        await update();

                                        const formResult = await handleFormResult(result);
                                        success = formResult.success;
                                        warning = formResult.warning;
                                        error = formResult.error;

                                        // trigger the instance to be rendered
                                        onViewChallenge(cid);

                                        await invalidateAll();
                                        setTimeout(clearResult, 5000);
                                    };
                                }}>
                                    <input type="hidden" name="cid" value={challengeInfo.id} />
                                    <Button
                                        type="submit"
                                        class="bg-brand-green text-[#08131f]! hover:brightness-105"
                                    >
                                        Launch Instance
                                    </Button>
                                </form>
                            {/if}
                        {:else}
                            {@const cid = challengeInfo.id}
                            <div>
                                <div class="mb-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-sm text-foreground">
                                    {instanceLabel} {timeLeft}
                                </div>
                                <p class="mb-1 text-sm text-foreground">Connect to Instance</p>
                                <code class="font-mono text-brand-green">
                                    <span class="select-none">$ </span><span class="select-all">{instance_infomation}</span>
                                </code>
                                <form method="POST" action="?/create_instance" class="mt-2" use:enhance={() => {
                                    return async ({ result, update }) => {
                                        await update();

                                        const formResult = await handleFormResult(result);
                                        success = formResult.success;
                                        warning = formResult.warning;
                                        error = formResult.error;

                                        // trigger the instance to be rendered
                                        onViewChallenge(cid);

                                        await invalidateAll();
                                        setTimeout(clearResult, 5000);
                                    };
                                }}>
                                    <input type="hidden" name="cid" value={challengeInfo.id} />
                                    <Button
                                        type="submit"
                                        class="bg-brand-green text-[#08131f]! hover:brightness-105"
                                    >
                                        Restart Instance
                                    </Button>
                                </form>
                            </div>
                        {/if}

                        {#if challengeInfo.image_ref}
                            {#if !ssh_active}
                                {@const cid = challengeInfo.id}
                                <form method="POST" action="?/create_ssh_instance" use:enhance={({ cancel }) => {
                                    if (otherInstanceActive && !window.confirm("You have another active instance running elsewhere. Launching this instance will end it and any progress will be lost. Continue?")) {
                                        cancel();
                                        return;
                                    }
                                    return async ({ result, update }) => {
                                        await update();

                                        const formResult = await handleFormResult(result);
                                        success = formResult.success;
                                        warning = formResult.warning;
                                        error = formResult.error;

                                        // trigger the ssh instance to be rendered
                                        onViewChallenge(cid);

                                        await invalidateAll();
                                        setTimeout(clearResult, 5000);
                                    };
                                }}>
                                    <input type="hidden" name="cid" value={challengeInfo.id} />
                                    <button type="submit" class="btn btn-success">
                                        Launch SSH Instance
                                    </button>
                                </form>
                            {:else}
                                {@const cid = challengeInfo.id}
                                <div>
                                    <div
                                        style="border-style: solid; border-radius: 3px; border-color: orange; border-radius: 8px; padding: 5px;"
                                    >
                                        Time Remaining: {sshTimeLeft}
                                    </div>
                                    Connect via SSH<br>
                                    <code class="font-mono text-green-400">
                                        <span class="select-none">$ </span><span class="select-all">{ssh_command}</span>
                                    </code>
                                    <br>
                                    Password:
                                    <code class="font-mono text-green-400 select-all">
                                        {ssh_password}
                                    </code>
                                    <form method="POST" action="?/create_ssh_instance" use:enhance={() => {
                                        return async ({ result, update }) => {
                                            await update();

                                            const formResult = await handleFormResult(result);
                                            success = formResult.success;
                                            warning = formResult.warning;
                                            error = formResult.error;

                                            // trigger the ssh instance to be re-rendered
                                            onViewChallenge(cid);

                                            await invalidateAll();
                                            setTimeout(clearResult, 5000);
                                        };
                                    }}>
                                        <input type="hidden" name="cid" value={challengeInfo.id} />
                                        <button type="submit" class="btn btn-success">
                                            Restart SSH Instance
                                        </button>
                                    </form>
                                </div>
                            {/if}
                        {/if}

                        {#if challengeInfo.web_image_ref}
                            <div class="mb-2">
                                {#if web_active}
                                    <div
                                        style="border-style: solid; border-radius: 3px; border-color: orange; border-radius: 8px; padding: 5px;"
                                    >
                                        Web Challenge
                                    </div>
                                    Visit:<br>
                                    <code class="font-mono text-green-400 select-all">{web_url}</code>
                                {:else}
                                    <div class="text-muted-foreground">Instance not available yet.</div>
                                {/if}
                            </div>
                        {/if}

                        <p class="mt-3 mb-1 text-sm text-foreground">⭐ {Number(challengeInfo.rating).toFixed(1)} / 5</p>

                        {#if challengeInfo.hlinks && challengeInfo.hlinks.length > 0}
                            <details class="mt-2 rounded-lg border border-border p-3">
                                <summary class="cursor-pointer text-xs font-medium text-muted-foreground select-none">Challenge Files</summary>
                                <div class="mt-2 space-y-1.5">
                                    {#each challengeInfo.hlinks as link}
                                        <span class="block rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground">
                                            <a href={`/api/download/${link}?t=archive`}>{link}</a>
                                        </span>
                                    {/each}
                                </div>
                            </details>
                        {/if}

                        {#if challengeInfo.hints && challengeInfo.hints.length > 0}
                            <details class="mt-2 rounded-lg border border-border p-3">
                                <summary class="cursor-pointer text-xs font-medium text-muted-foreground select-none">Hints</summary>
                                <div class="mt-2 space-y-1.5">
                                    {#each challengeInfo.hints as hint}
                                        <span class="block rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground">{hint}</span>
                                    {/each}
                                </div>
                            </details>
                        {/if}

                        <p class="mt-3 text-sm text-foreground">Points: {challengeInfo.points}</p>
                        <p class="text-sm text-muted-foreground">{challengeInfo.solves} Solves</p>
                    </div>

                    <!-- Footer action -->
                    <div class="border-t border-border p-4">
                        <form method="POST" action="?/submit_flag" use:enhance={() => {
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
                            <input type="hidden" name="cid" value={challengeInfo.id} />
                            <div class="flex gap-2">
                                <Input
                                    name="flag_value"
                                    type="text"
                                    placeholder="Enter Flag"
                                    required
                                    class="flex-1 inputText"
                                />
                                <Button type="submit">
                                    Submit
                                </Button>
                            </div>
                        </form>

                        {#if !hasRated(challengeInfo.id) && hasSolved(challengeInfo.id)}
                            <form method="POST" action="?/submit_rating" use:enhance={() => {
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
                                <input type="hidden" name="cid" value={challengeInfo.id} />
                                <input type="hidden" name="rating" value={selectedRating} />

                                <div class="mt-3 flex items-center gap-3">
                                    <div class="flex items-center gap-1">
                                        {#each [1, 2, 3, 4, 5] as star}
                                            <button
                                                type="button"
                                                class="text-2xl leading-none transition-transform hover:scale-110 {star <= selectedRating || star <= hoveredRating ? 'text-amber-400' : 'text-muted-foreground/30'}"
                                                onmouseenter={() => hoveredRating = star}
                                                onmouseleave={() => hoveredRating = 0}
                                                onclick={() => selectedRating = star}
                                                aria-label="Rate {star} star{star !== 1 ? 's' : ''}"
                                            >
                                                ★
                                            </button>
                                        {/each}
                                    </div>

                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={selectedRating === 0}
                                    >
                                        Submit Rating
                                    </Button>
                                </div>
                            </form>
                        {/if}

                    </div>

                </div>
            {:else}
                <div class="rounded-2xl border border-border bg-card! p-4">
                    <p class="text-sm text-destructive">Error getting challenge info.</p>
                </div>
            {/if}

        </div>
    </div>
{/if}