<script lang="ts">
    import { enhance } from "$app/forms";
    import { handleFormResult } from "$lib/utilities";
    import Feedback from "$lib/components/feedback.svelte";
    
    import { Input } from "$lib/components/ui/input";
    import * as Table from "$lib/components/ui/table";
    import * as Card from "$lib/components/ui/card";
    import { Label } from '$lib/components/ui/label';
    import { Button } from "$lib/components/ui/button";
    import Trophy from "@lucide/svelte/icons/trophy";
    import Podium from "$lib/components/leaderboard/podium.svelte";
    import ScoreRaceChart from "$lib/components/leaderboard/score-race-chart.svelte";
    import { invalidateAll } from "$app/navigation";

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

<main class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">
    <Feedback success={success} warning={warning} error={error} />

    <div class="text-center">
        <h2 class="font-mono text-2xl font-bold text-foreground">KHI Leaderboard</h2>
        <div class="mt-4 gap-4 flex justify-center">
            <Input type="text" placeholder="Search by name..." bind:value={searchValue} class="max-w-sm inputText" />
            <a href="/history">Archived Leaderboards</a>
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

                    {#if data.isAdmin}
                        <form
                            method="POST"
                            action="?/archive_leaderboard"
                            class="flex items-end gap-3"
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
                                <Input
                                    type="number"
                                    id="year"
                                    name="year"
                                    bind:value={yearValue}
                                    class="w-24"
                                />
                            </div>
                            <Button
                                type="submit"
                                class="bg-brand-green text-[#08131f]! hover:brightness-105"
                            >
                                Archive
                            </Button>
                        </form>
                    {/if}
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
