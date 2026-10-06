<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { handleFormResult } from "$lib/browser_utils.js";

    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Table from "$lib/components/ui/table";
    import Feedback from "$lib/components/feedback.svelte";
    import PageHeader from "$lib/components/page-header.svelte";
    import Panel from "$lib/components/panel.svelte";
    import Search from "@lucide/svelte/icons/search";
    import Podium from "$lib/components/leaderboard/podium.svelte";
    import ScoreRaceChart from "$lib/components/leaderboard/score-race-chart.svelte";

    const { data } = $props();

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");
    let searchValue = $state("");
    let yearValue = $state<number>(0);

    const filtered = $derived(
        data.board.filter((entry: any) => {
            return entry.name.toLowerCase().includes(searchValue.toLowerCase());
        })
    );

    const gapToNext = $derived.by(() => {
        const gaps = new Map<string, number>();
        data.board.forEach((entry: any, i: number) => {
            if (i > 0) gaps.set(entry.name, data.board[i - 1].score - entry.score);
        });
        return gaps;
    });
</script>

<main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8">
    <Feedback success={success} warning={warning} error={error} />

    <PageHeader
        eyebrow="Standings"
        title="Leaderboard"
        description="Live rankings for this year's event."
    >
        {#snippet actions()}
            <div class="flex flex-wrap items-center gap-2">
                <Button href="/history" variant="outline">History</Button>
                {#if data.user_placement}
                    <div class="flex items-center gap-3 rounded-lg border border-brand-green/30 bg-brand-green/8 px-3 py-1.5">
                        <span class="eyebrow">Your placement</span>
                        <span class="font-mono text-base font-semibold text-brand-green tabular-nums">#{data.user_placement.rank}</span>
                        <span class="font-mono text-xs text-muted-foreground tabular-nums">{data.user_placement.score.toLocaleString()} pts</span>
                    </div>
                {/if}
            </div>
        {/snippet}
    </PageHeader>

    <Podium top3={data.board.slice(0, 3)} />

    <div class="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Rankings">
            {#snippet actions()}
                <div class="relative">
                    <Search class="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name…"
                        aria-label="Search by name"
                        bind:value={searchValue}
                        class="h-7 w-44 pl-7 text-sm sm:w-56"
                    />
                </div>
            {/snippet}
            <Table.Root>
                <Table.Header>
                    <Table.Row class="hover:bg-transparent">
                        <Table.Head class="h-9 w-14 pl-4 text-xs font-medium text-muted-foreground">Rank</Table.Head>
                        <Table.Head class="h-9 text-xs font-medium text-muted-foreground">Name</Table.Head>
                        <Table.Head class="h-9 text-right text-xs font-medium text-muted-foreground" title="Points behind the rank above">Gap</Table.Head>
                        <Table.Head class="h-9 pr-4 text-right text-xs font-medium text-muted-foreground">Score</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each filtered as entry}
                        {@const isMe = entry.name === data.user_placement?.name}
                        <Table.Row class={isMe ? 'bg-brand-green/8 hover:bg-brand-green/12' : ''}>
                            <Table.Cell class="py-2.5 pl-4 font-mono text-sm tabular-nums {entry.rank <= 3 ? 'font-semibold text-foreground' : 'text-muted-foreground'}">
                                {entry.rank}
                            </Table.Cell>
                            <Table.Cell class="max-w-0 py-2.5 text-sm text-foreground">
                                <span class="flex items-center gap-2">
                                    <span class="truncate {isMe ? 'font-semibold' : ''}">{entry.name}</span>
                                    {#if isMe}
                                        <span class="shrink-0 rounded-full bg-brand-green/15 px-1.5 text-[0.6875rem] font-medium text-brand-green">You</span>
                                    {/if}
                                </span>
                            </Table.Cell>
                            <Table.Cell class="py-2.5 text-right font-mono text-xs text-muted-foreground tabular-nums">
                                {gapToNext.get(entry.name) ? `−${gapToNext.get(entry.name)!.toLocaleString()}` : gapToNext.has(entry.name) ? "tied" : ""}
                            </Table.Cell>
                            <Table.Cell class="py-2.5 pr-4 text-right font-mono text-sm font-medium text-foreground tabular-nums">
                                {entry.score.toLocaleString()}
                            </Table.Cell>
                        </Table.Row>
                    {:else}
                        <Table.Row class="hover:bg-transparent">
                            <Table.Cell colspan={4} class="py-10 text-center text-sm text-muted-foreground">
                                {data.board.length === 0 ? "No scores yet." : "No one matches your search."}
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </Panel>

        <div class="min-w-0 space-y-4">
            <Panel title="Score race">
                <ScoreRaceChart series={data.scoreRace} />
            </Panel>

            {#if data.isAdmin}
                <Panel title="Archive">
                    <div class="p-4">
                        <p class="mb-4 text-sm text-muted-foreground">Save these standings to the leaderboard history.</p>
                        <form
                            method="POST"
                            action="?/archive_leaderboard"
                            class="flex flex-wrap items-end gap-3"
                            use:enhance={({ formData }) => {
                                if (!window.confirm(`Do you want to archive this leaderboard for KHI ${yearValue}`)) {
                                    return;
                                }

                                formData.set('leaderboard', JSON.stringify({ board: data.board }));

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
                            <div class="flex flex-col gap-1.5">
                                <Label for="year" class="text-xs text-muted-foreground">Year</Label>
                                <Input type="number" id="year" name="year" bind:value={yearValue} class="w-24 font-mono tabular-nums" />
                            </div>
                            <Button type="submit">Archive</Button>
                        </form>
                    </div>
                </Panel>
            {/if}
        </div>
    </div>
</main>
