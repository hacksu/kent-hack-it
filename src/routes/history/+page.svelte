<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import * as Table from "$lib/components/ui/table";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import * as Carousel from "$lib/components/ui/carousel";
    import Trophy from "@lucide/svelte/icons/trophy";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import Podium from "$lib/components/leaderboard/podium.svelte";

    interface BoardEntry {
        name: string;
        score: number;
        members?: string[];
    }

    interface RankedEntry extends BoardEntry {
        rank: number;
    }

    const { data } = $props();

    let searchValue = $state("");

    // Attach rank from the original board position before any filtering happens,
    // so an entry's rank stays stable ("board[0]" is always rank 1) regardless
    // of what the search narrows down to.
    const rankedBoard = $derived<RankedEntry[]>(
        data.history ? data.history.board.map((entry: BoardEntry, i: number) => ({
            ...entry,
            rank: i + 1
        })) : []
    );

    const filtered = $derived(
        rankedBoard.filter((entry: RankedEntry) => {
            const query = searchValue.toLowerCase();
            const nameMatch = entry.name.toLowerCase().includes(query);
            const memberMatch = entry.members?.some((m) => m.toLowerCase().includes(query));
            return nameMatch || memberMatch;
        })
    );

    const gapToNext = $derived.by(() => {
        const gaps = new Map<string, number>();
        rankedBoard.forEach((entry: RankedEntry, i: number) => {
            if (i > 0) gaps.set(entry.name, rankedBoard[i - 1].score - entry.score);
        });
        return gaps;
    });

    // Tracks which team rows have their member list expanded
    let openMembers = $state(new Set<string>());
    function toggleMembers(name: string) {
        const next = new Set(openMembers);
        next.has(name) ? next.delete(name) : next.add(name);
        openMembers = next;
    }
</script>

<main class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">
    <Carousel.Root class="w-full max-w-full" opts={{ align: "start", dragFree: true }}>
        <Carousel.Content class="-ml-2">
            {#each data.evt_archives as evt}
                <Carousel.Item class="basis-auto pl-2">
                    <a
                        href="/history?year={evt}"
                        class="flex h-full items-center rounded-full border border-border bg-card px-4 py-2 text-sm whitespace-nowrap hover:bg-muted/40"
                    >
                        {evt}
                    </a>
                </Carousel.Item>
            {/each}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
    </Carousel.Root>

    {#if data.history}
        <div class="text-center">
            <h2 class="font-mono text-2xl font-bold text-foreground">KHI {data.year} Leaderboard</h2>
            <div class="mt-4 flex justify-center">
                <Input type="text" placeholder="Search by name..." bind:value={searchValue} class="max-w-sm inputText" />
            </div>
        </div>

        <div class="mt-8">
            <Podium top3={rankedBoard.slice(0, 3)} />
        </div>

        <div class="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-1">
            <div class="flex flex-col gap-4">
                <div class="rounded-2xl border border-border bg-card">
                    <div class="flex items-center gap-2 border-b border-border px-4 py-3">
                        <Trophy class="h-4.5 w-4.5 text-[#BA7517]" />
                        <span class="font-medium text-foreground">Leaderboard</span>
                    </div>
                    <Table.Root>
                        <Table.Body>
                            {#each filtered as entry (entry.name)}
                                {@const hasMembers = !!entry.members?.length}
                                {@const isOpen = openMembers.has(entry.name)}
                                <Table.Row border-border transition-colors hover:bg-muted/40">
                                    <Table.Cell class="w-12 py-3 pl-4 text-center align-middle font-mono text-sm text-muted-foreground">
                                        {entry.rank}
                                    </Table.Cell>
                                    <Table.Cell class="py-3 align-middle text-sm 'text-foreground/90'">
                                        {#if hasMembers}
                                            <Collapsible.Root open={isOpen} onOpenChange={() => toggleMembers(entry.name)}>
                                                <Collapsible.Trigger class="flex items-center gap-1.5">
                                                    <span>{entry.name}</span>
                                                    <ChevronDown
                                                        class="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}"
                                                    />
                                                </Collapsible.Trigger>
                                                <Collapsible.Content class="mt-2 flex flex-wrap gap-1.5">
                                                    {#each entry.members ?? [] as member}
                                                        <span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                            {member}
                                                        </span>
                                                    {/each}
                                                </Collapsible.Content>
                                            </Collapsible.Root>
                                        {:else}
                                            <span>{entry.name}</span>
                                        {/if}
                                    </Table.Cell>
                                    <Table.Cell class="w-20 py-3 text-right align-middle font-mono text-xs text-muted-foreground">
                                        {gapToNext.has(entry.name) ? `↓ ${gapToNext.get(entry.name)!.toLocaleString()}` : ''}
                                    </Table.Cell>
                                    <Table.Cell class="w-28 py-3 pr-4 text-right align-middle">
                                        <span class="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-normal whitespace-nowrap text-muted-foreground">
                                            {entry.score.toLocaleString()} pts
                                        </span>
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </div>
        </div>
    {:else}
        <div class="text-center">
            <h2 class="font-mono text-2xl font-bold text-foreground">Event Leaderboard not Found</h2>
        </div>
    {/if}
</main>