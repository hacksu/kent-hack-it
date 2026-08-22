<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import * as Table from "$lib/components/ui/table";
    import * as Card from "$lib/components/ui/card";
    import Trophy from "@lucide/svelte/icons/trophy";
    import Podium from "$lib/components/leaderboard/podium.svelte";
    import ScoreRaceChart from "$lib/components/leaderboard/score-race-chart.svelte";

    const { data } = $props();
    let searchValue = $state("");

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

<main class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">
    <div class="text-center">
        <h2 class="font-mono text-2xl font-bold text-foreground">KHI Leaderboard</h2>
        <div class="mt-4 flex justify-center">
            <Input type="text" placeholder="Search by name..." bind:value={searchValue} class="max-w-sm inputText" />
        </div>
    </div>

    <div class="mt-8">
        <Podium top3={data.board.slice(0, 3)} />
    </div>

    <div class="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div class="flex flex-col gap-4">
            {#if data.user_placement}
                <div class="rounded-2xl border border-border bg-card p-4 text-center">
                    <p class="text-sm text-muted-foreground">Your placement</p>
                    <p class="mt-1 text-3xl font-medium text-brand-blue">#{data.user_placement.rank}</p>
                    <p class="mt-1 text-sm text-muted-foreground">{data.user_placement.score.toLocaleString()} pts</p>
                </div>
            {/if}

            <div class="rounded-2xl border border-border bg-card">
                <div class="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Trophy class="h-4.5 w-4.5 text-[#BA7517]" />
                    <span class="font-medium text-foreground">Leaderboard</span>
                </div>
                <Table.Root>
                    <Table.Body>
                        {#each filtered as entry}
                            {@const isMe = entry.name === data.user_placement?.name}
                            <Table.Row class="{isMe ? 'bg-brand-green/8' : ''} border-border">
                                <Table.Cell class="w-10 text-center text-sm text-muted-foreground">{entry.rank}</Table.Cell>
                                <Table.Cell class="text-sm {isMe ? 'font-medium text-foreground' : 'text-foreground/90'}">
                                    {entry.name}
                                </Table.Cell>
                                <Table.Cell class="w-16 text-right font-mono text-xs text-muted-foreground">
                                    {gapToNext.has(entry.name) ? `↓ ${gapToNext.get(entry.name)!.toLocaleString()}` : ' '}
                                </Table.Cell>
                                <Table.Cell class="text-right">
                                    <span class="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                                        {entry.score.toLocaleString()} pts
                                    </span>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
        </div>

        <Card.Root class="overflow-hidden border border-border bg-card">
            <ScoreRaceChart series={data.scoreRace} />
        </Card.Root>
    </div>
</main>
