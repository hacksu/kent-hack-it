<script lang="ts">
    import { type ViewableChallengeData } from "$lib/database/db.js";
    import { difficultyTone } from "$lib/difficulty";

    import Check from "@lucide/svelte/icons/check";
    import Star from "@lucide/svelte/icons/star";
    import Users from "@lucide/svelte/icons/users";

    const {
        challenge,
        solved = false,
        teamSolved = false,
        onclick,
    }: {
        challenge: ViewableChallengeData;
        solved?: boolean;
        teamSolved?: boolean;
        onclick: () => void;
    } = $props();

    const tone = $derived(difficultyTone(challenge.difficulty));
</script>

<button
    type="button"
    class="group flex h-full flex-col rounded-xl border bg-card p-4 text-left transition-colors outline-none hover:border-input hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40
        {solved ? 'border-brand-green/35' : 'border-border'}"
    {onclick}
>
    <div class="flex h-5 w-full items-center justify-between gap-2">
        <span class="eyebrow truncate">{challenge.category}</span>
        <span class="flex shrink-0 items-center gap-1.5">
            {#if teamSolved}
                <span
                    class="flex h-5 items-center gap-1 rounded-full bg-brand-blue/15 px-1.5 text-[0.6875rem] font-medium text-brand-blue"
                    title="Your team solved this"
                >
                    <Users class="size-3" />
                    <span class="sr-only">Solved by your </span>Team
                </span>
            {/if}
            {#if solved}
                <span
                    class="flex size-5 items-center justify-center rounded-full bg-brand-green text-primary-foreground"
                    title="You solved this"
                >
                    <Check class="size-3" strokeWidth={3} />
                    <span class="sr-only">Solved</span>
                </span>
            {/if}
        </span>
    </div>

    <div class="mt-2 flex w-full flex-1 flex-col {!challenge.is_active ? 'opacity-55' : ''}">
        <h3 class="line-clamp-2 text-[0.9375rem] leading-snug font-semibold text-foreground">{challenge.name}</h3>

        {#if challenge.description}
            <p class="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {challenge.description}
            </p>
        {/if}

        <p class="mt-2 truncate text-xs text-muted-foreground">
            by {challenge.written_by || 'Unknown author'}
        </p>

        <div class="mt-auto flex items-end justify-between gap-3 pt-4">
            <div class="flex min-w-0 flex-col gap-1.5">
                {#if !challenge.is_active}
                    <span class="w-fit rounded-md bg-warning/15 px-1.5 py-0.5 text-[0.6875rem] font-medium text-warning">
                        Offline, back soon
                    </span>
                {/if}
                <div class="flex items-center gap-3 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1.5 font-medium {tone.text}">
                        <span class="size-1.5 rounded-full {tone.dot}"></span>
                        {challenge.difficulty}
                    </span>
                    <span class="flex items-center gap-1 tabular-nums" title="Average rating">
                        <Star class="size-3 fill-gold text-gold" />
                        {Number(challenge.rating).toFixed(1)}
                    </span>
                    <span class="tabular-nums">
                        {challenge.solves} {challenge.solves === 1 ? 'solve' : 'solves'}
                    </span>
                </div>
            </div>
            <span class="shrink-0 font-mono text-sm font-semibold text-foreground tabular-nums">
                {challenge.points}<span class="ml-0.5 text-xs font-normal text-muted-foreground">pts</span>
            </span>
        </div>
    </div>
</button>
