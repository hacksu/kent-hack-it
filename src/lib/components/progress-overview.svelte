<script lang="ts">
    import { slide } from "svelte/transition";
    import type { Stat } from "$lib/mtypes";

    import ChallengesProgressBar from "$lib/components/challenges-progress-bar.svelte";
    import CategoryStrengthChart from "$lib/components/category-strength-chart.svelte";
    import ContributionDonut from "$lib/components/team/contribution-donut.svelte";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";

    const {
        mine,
        team = undefined,
    }: {
        /** The player's own progress: overall total first, then one entry per category. */
        mine: Stat[];
        /** Team progress in the same shape, plus first-solve credit per member. */
        team?: { bars: Stat[]; pie: { name: string; contributions: number }[] } | null;
    } = $props();

    let view = $state<"mine" | "team">("mine");
    let showBreakdown = $state(false);

    const bars = $derived(view === "team" && team ? team.bars : mine);
    const overall = $derived(bars[0] ?? { value: 0, total: 0 });
    const categories = $derived(bars.slice(1));

    const teamSolves = $derived(team?.pie.reduce((sum, m) => sum + m.contributions, 0) ?? 0);
    const teamMembers = $derived(
        (team?.pie ?? []).map((m) => ({
            name: m.name,
            points: m.contributions,
            pct: teamSolves > 0 ? Math.round((m.contributions / teamSolves) * 100) : 0,
        }))
    );

    const tabClass =
        "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm";
</script>

<section class="overflow-hidden rounded-xl border border-border bg-card">
    <div class="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2">
        <h2 class="eyebrow">Progress</h2>
        {#if team}
            <div class="flex rounded-lg bg-muted p-0.5" role="group" aria-label="Whose progress to show">
                <button type="button" class={tabClass} aria-pressed={view === "mine"} onclick={() => (view = "mine")}>
                    You
                </button>
                <button type="button" class={tabClass} aria-pressed={view === "team"} onclick={() => (view = "team")}>
                    Team
                </button>
            </div>
        {/if}
    </div>

    <ChallengesProgressBar solved={overall.value} total={overall.total} />

    <button
        type="button"
        class="flex w-full items-center justify-between border-t border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-accent/40 hover:text-foreground focus-visible:bg-accent/40"
        aria-expanded={showBreakdown}
        onclick={() => (showBreakdown = !showBreakdown)}
    >
        <span>{view === "team" ? "Category breakdown and contributions" : "Category breakdown"}</span>
        <ChevronDown class="size-3.5 transition-transform duration-300 {showBreakdown ? 'rotate-180' : ''}" />
    </button>

    {#if showBreakdown}
        <div transition:slide={{ duration: 250 }} class="border-t border-border">
            {#if view === "team" && team}
                <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] lg:divide-x lg:divide-border">
                    <CategoryStrengthChart {categories} />
                    <div class="border-t border-border lg:border-t-0">
                        <ContributionDonut members={teamMembers} score={teamSolves} unit="first solves" />
                    </div>
                </div>
            {:else}
                <CategoryStrengthChart {categories} />
            {/if}
        </div>
    {/if}
</section>
