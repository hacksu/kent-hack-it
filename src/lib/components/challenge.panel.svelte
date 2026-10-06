<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import type { SubmitFunction } from "@sveltejs/kit";

    import Feedback from "$lib/components/feedback.svelte";
    import CommandLine from "$lib/components/command-line.svelte";

    import { type ViewableChallengeData } from "$lib/database/db";
    import { difficultyTone } from "$lib/difficulty";
    import { handleFormResult } from "$lib/browser_utils.js";

    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import * as Dialog from "$lib/components/ui/dialog";
    import Check from "@lucide/svelte/icons/check";
    import Clock from "@lucide/svelte/icons/clock";
    import Download from "@lucide/svelte/icons/download";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Flag from "@lucide/svelte/icons/flag";
    import Lightbulb from "@lucide/svelte/icons/lightbulb";
    import Play from "@lucide/svelte/icons/play";
    import RotateCw from "@lucide/svelte/icons/rotate-cw";
    import Star from "@lucide/svelte/icons/star";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

    let {
        challengeInfo,
        showPanel = $bindable(false),
        success = $bindable(""),
        warning = $bindable(""),
        error = $bindable(""),
        instance_infomation,
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
        clearResult,
        onViewChallenge
    }: {
        challengeInfo: ViewableChallengeData | undefined;
        showPanel: boolean;
        success: string;
        warning: string;
        error: string;
        instance_infomation: string;
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
        clearResult: () => void;
        onViewChallenge: (cid: string | number) => void;
    } = $props();

    // Local to the panel: reset naturally each time a new challenge is viewed
    // since the component's rating form is only ever shown while a panel is open.
    let selectedRating = $state(0);
    let hoveredRating = $state(0);

    const OTHER_INSTANCE_WARNING =
        "You have another active instance running elsewhere. Launching this instance will end it and any progress will be lost. Continue?";

    /**
     * Shared use:enhance handler for every form in the panel.
     * - `confirmOther`: ask before replacing an instance running on another challenge
     * - `refreshInstance`: re-fetch instance state so the connection details render
     */
    function submit(opts: { confirmOther?: boolean; refreshInstance?: boolean } = {}): SubmitFunction {
        return ({ cancel }) => {
            if (opts.confirmOther && otherInstanceActive && !window.confirm(OTHER_INSTANCE_WARNING)) {
                cancel();
                return;
            }
            const cid = challengeInfo?.id;
            return async ({ result, update }) => {
                await update();

                const formResult = await handleFormResult(result);
                success = formResult.success;
                warning = formResult.warning;
                error = formResult.error;

                if (opts.refreshInstance && cid !== undefined) onViewChallenge(cid);

                await invalidateAll();
                setTimeout(clearResult, 5000);
            };
        };
    }

    const sectionClass = "rounded-lg border border-border bg-background/50 p-3";
    const sectionTitleClass = "text-sm font-medium text-foreground";
</script>

{#snippet countdown(value: string)}
    <span
        class="flex items-center gap-1.5 rounded-md bg-warning/12 px-2 py-0.5 font-mono text-xs font-medium text-warning tabular-nums"
        title="Time remaining"
    >
        <Clock class="size-3" />
        <span class="sr-only">Time remaining </span>{value}
    </span>
{/snippet}

<Dialog.Root bind:open={showPanel}>
    <Dialog.Content class="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {#if challengeInfo}
            {@const cid = challengeInfo.id}
            {@const tone = difficultyTone(challengeInfo.difficulty)}
            {@const solved = hasSolved(cid)}
            {@const hasNetcat = challengeInfo.nsjail_conf != null && challengeInfo.nsjail_conf.length > 0}

            <!-- Header -->
            <Dialog.Header class="gap-0 border-b border-border px-5 pt-5 pb-4">
                <div class="flex flex-wrap items-center gap-2 pr-8">
                    <span class="eyebrow">{challengeInfo.category}</span>
                    <span class="rounded-full border px-2 py-px text-[0.6875rem] font-medium {tone.badge}">
                        {challengeInfo.difficulty}
                    </span>
                    {#if solved}
                        <span class="flex items-center gap-1 rounded-full bg-brand-green/15 px-2 py-px text-[0.6875rem] font-medium text-brand-green">
                            <Check class="size-3" strokeWidth={3} />
                            Solved
                        </span>
                    {/if}
                </div>
                <Dialog.Title class="mt-2 text-lg leading-snug font-semibold text-foreground">
                    {challengeInfo.name}
                </Dialog.Title>
                <Dialog.Description class="mt-0.5 text-sm text-muted-foreground">
                    by {challengeInfo.written_by || 'Unknown author'}
                </Dialog.Description>

                <dl class="mt-4 flex items-center gap-6 text-sm">
                    <div>
                        <dt class="eyebrow text-[0.625rem]">Points</dt>
                        <dd class="font-mono font-semibold text-foreground tabular-nums">{challengeInfo.points}</dd>
                    </div>
                    <div>
                        <dt class="eyebrow text-[0.625rem]">Solves</dt>
                        <dd class="font-mono font-semibold text-foreground tabular-nums">{challengeInfo.solves}</dd>
                    </div>
                    <div>
                        <dt class="eyebrow text-[0.625rem]">Rating</dt>
                        <dd class="flex items-center gap-1 font-mono font-semibold text-foreground tabular-nums">
                            <Star class="size-3.5 fill-gold text-gold" />
                            {Number(challengeInfo.rating).toFixed(1)}<span class="font-normal text-muted-foreground">/5</span>
                        </dd>
                    </div>
                </dl>
            </Dialog.Header>

            <!-- Body -->
            <div class="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {#if !challengeInfo.is_active}
                    <div class="flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                        <TriangleAlert class="mt-0.5 size-4 shrink-0" />
                        <span>This challenge is out of order and will be back online soon.</span>
                    </div>
                {/if}

                {#if challengeInfo.description}
                    <p class="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                        {challengeInfo.description}
                    </p>
                {/if}

                <!-- Netcat instance -->
                {#if instance_infomation.length > 0}
                    <div class={sectionClass}>
                        <div class="mb-2 flex items-center justify-between gap-2">
                            <span class={sectionTitleClass}>Connect to your instance</span>
                            {@render countdown(timeLeft)}
                        </div>
                        <CommandLine value={instance_infomation} />
                        <form method="POST" action="?/create_instance" class="mt-2" use:enhance={submit({ refreshInstance: true })}>
                            <input type="hidden" name="cid" value={cid} />
                            <Button type="submit" variant="outline" size="sm">
                                <RotateCw />
                                Restart instance
                            </Button>
                        </form>
                    </div>
                {:else if hasNetcat}
                    <div class="{sectionClass} flex items-center justify-between gap-3">
                        <div>
                            <p class={sectionTitleClass}>Remote instance</p>
                            <p class="text-xs text-muted-foreground">Starts a private netcat endpoint for you.</p>
                        </div>
                        <form method="POST" action="?/create_instance" use:enhance={submit({ confirmOther: true, refreshInstance: true })}>
                            <input type="hidden" name="cid" value={cid} />
                            <Button type="submit" variant="secondary">
                                <Play />
                                Launch instance
                            </Button>
                        </form>
                    </div>
                {/if}

                <!-- SSH instance -->
                {#if challengeInfo.image_ref}
                    {#if ssh_active}
                        <div class={sectionClass}>
                            <div class="mb-2 flex items-center justify-between gap-2">
                                <span class={sectionTitleClass}>Connect via SSH</span>
                                {@render countdown(sshTimeLeft)}
                            </div>
                            <CommandLine value={ssh_command} />
                            <p class="mt-2 mb-1 text-xs text-muted-foreground">Password</p>
                            <CommandLine value={ssh_password} prompt="" label="Copy password" />
                            <form method="POST" action="?/create_ssh_instance" class="mt-2" use:enhance={submit({ refreshInstance: true })}>
                                <input type="hidden" name="cid" value={cid} />
                                <Button type="submit" variant="outline" size="sm">
                                    <RotateCw />
                                    Restart SSH instance
                                </Button>
                            </form>
                        </div>
                    {:else}
                        <div class="{sectionClass} flex items-center justify-between gap-3">
                            <div>
                                <p class={sectionTitleClass}>SSH instance</p>
                                <p class="text-xs text-muted-foreground">Starts a private machine you can SSH into.</p>
                            </div>
                            <form method="POST" action="?/create_ssh_instance" use:enhance={submit({ confirmOther: true, refreshInstance: true })}>
                                <input type="hidden" name="cid" value={cid} />
                                <Button type="submit" variant="secondary">
                                    <Play />
                                    Launch SSH instance
                                </Button>
                            </form>
                        </div>
                    {/if}
                {/if}

                <!-- Web instance -->
                {#if challengeInfo.web_image_ref}
                    <div class={sectionClass}>
                        <p class="{sectionTitleClass} mb-2">Web challenge</p>
                        {#if web_active}
                            <div class="flex items-center gap-2">
                                <CommandLine value={web_url} prompt="" label="Copy URL" class="min-w-0 flex-1" />
                                <Button href={web_url} target="_blank" rel="noopener noreferrer" variant="outline">
                                    Open
                                    <ExternalLink />
                                </Button>
                            </div>
                        {:else}
                            <p class="text-sm text-muted-foreground">Instance not available yet.</p>
                        {/if}
                    </div>
                {/if}

                <!-- Files -->
                {#if challengeInfo.hlinks && challengeInfo.hlinks.length > 0}
                    <div>
                        <p class="eyebrow mb-1.5">Files</p>
                        <ul class="flex flex-wrap gap-2">
                            {#each challengeInfo.hlinks as link}
                                <li>
                                    <a
                                        href={`/api/download/${link}?t=archive`}
                                        class="flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2.5 py-1.5 font-mono text-xs text-foreground transition-colors hover:border-input hover:bg-accent"
                                    >
                                        <Download class="size-3.5 text-muted-foreground" />
                                        {link}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}

                <!-- Hints: collapsed by default so they are not spoiled at a glance -->
                {#if challengeInfo.hints && challengeInfo.hints.length > 0}
                    <details class="group rounded-lg border border-border">
                        <summary class="flex list-none items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
                            <Lightbulb class="size-4" />
                            {challengeInfo.hints.length === 1 ? 'Show hint' : `Show ${challengeInfo.hints.length} hints`}
                        </summary>
                        <ol class="space-y-1.5 border-t border-border p-3">
                            {#each challengeInfo.hints as hint, i}
                                <li class="flex gap-2.5 text-sm text-foreground/90">
                                    <span class="font-mono text-xs leading-5 text-muted-foreground tabular-nums">{i + 1}.</span>
                                    <span>{hint}</span>
                                </li>
                            {/each}
                        </ol>
                    </details>
                {/if}
            </div>

            <!-- Footer: flag submission -->
            <div class="border-t border-border bg-background/40 px-5 py-4">
                <Feedback {success} {warning} {error} />

                <form method="POST" action="?/submit_flag" use:enhance={submit()}>
                    <input type="hidden" name="cid" value={cid} />
                    <div class="flex gap-2">
                        <div class="relative flex-1">
                            <Flag class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                name="flag_value"
                                type="text"
                                placeholder="Enter flag"
                                aria-label="Flag"
                                autocomplete="off"
                                autocapitalize="off"
                                spellcheck={false}
                                required
                                class="h-10 pl-9 font-mono"
                            />
                        </div>
                        <Button type="submit" class="h-10 px-4">
                            Submit
                        </Button>
                    </div>
                </form>

                {#if !hasRated(cid) && solved}
                    <form method="POST" action="?/submit_rating" use:enhance={submit()}>
                        <input type="hidden" name="cid" value={cid} />
                        <input type="hidden" name="rating" value={selectedRating} />

                        <div class="mt-3 flex items-center justify-between gap-3">
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-muted-foreground">Rate this challenge</span>
                                <div class="flex items-center" role="radiogroup" aria-label="Rating">
                                    {#each [1, 2, 3, 4, 5] as star}
                                        {@const lit = star <= (hoveredRating || selectedRating)}
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={selectedRating === star}
                                            class="rounded p-0.5 transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
                                            onmouseenter={() => hoveredRating = star}
                                            onmouseleave={() => hoveredRating = 0}
                                            onclick={() => selectedRating = star}
                                            aria-label="{star} star{star !== 1 ? 's' : ''}"
                                        >
                                            <Star class="size-5 {lit ? 'fill-gold text-gold' : 'text-muted-foreground/40'}" />
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            <Button type="submit" variant="outline" size="sm" disabled={selectedRating === 0}>
                                Submit rating
                            </Button>
                        </div>
                    </form>
                {/if}
            </div>
        {:else}
            <div class="p-5">
                <Dialog.Title class="text-base font-semibold">Challenge unavailable</Dialog.Title>
                <Dialog.Description class="mt-1 text-sm text-destructive">Error getting challenge info.</Dialog.Description>
            </div>
        {/if}
    </Dialog.Content>
</Dialog.Root>
