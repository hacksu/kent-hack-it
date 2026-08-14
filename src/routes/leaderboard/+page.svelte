<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import * as Table from "$lib/components/ui/table";
    import Trophy from "@lucide/svelte/icons/trophy";

    const { data } = $props();
    let searchValue = $state("");

    const filtered = $derived(
        data.board.filter((entry: any) => {
            return entry.name.toLowerCase().includes(searchValue.toLowerCase());
        })
    );

    const rankRowClass = (rank: number) =>
        rank === 1
            ? "bg-[#e9c422]/15"
            : rank === 2
              ? "bg-[#e2e1da]/15"
              : rank === 3
                ? "bg-[#f1936e]/15"
                : "";
</script>

<main class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-10">
    <div class="text-center">
        <h2 class="font-mono text-2xl font-bold text-foreground">KHI Leaderboard</h2>
        <div class="mt-4 flex justify-center">
            <Input type="text" placeholder="Search by name..." bind:value={searchValue} class="max-w-sm" />
        </div>
    </div>

    <div class="mt-6 flex flex-wrap items-start gap-4">
        {#if data.user_placement}
            <div class="min-w-[180px] flex-none rounded-2xl border border-border bg-card p-4">
                <p class="text-sm text-muted-foreground">Your placement</p>
                <div class="mt-1 flex items-baseline gap-2">
                    <span class="text-3xl font-medium text-foreground">#{data.user_placement.rank}</span>
                    <span class="text-sm text-muted-foreground">{data.user_placement.name}</span>
                </div>
                <p class="mt-1 text-sm text-muted-foreground">{data.user_placement.score.toLocaleString()} pts</p>
            </div>
        {/if}

        <div class="min-w-[280px] flex-1 rounded-2xl border border-border bg-card">
            <div class="flex items-center gap-2 border-b border-border px-4 py-3">
                <Trophy class="h-4.5 w-4.5 text-[#BA7517]" />
                <span class="font-medium text-foreground">Leaderboard</span>
            </div>
            <Table.Root>
                <Table.Body>
                    {#each filtered as entry}
                        <Table.Row class="{rankRowClass(entry.rank)} border-border">
                            <Table.Cell class="w-10 text-center text-sm text-muted-foreground">{entry.rank}</Table.Cell>
                            <Table.Cell class="text-sm {entry.name === data.user?.name ? 'font-medium text-foreground' : 'text-foreground/90'}">
                                {entry.name}
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
</main>
