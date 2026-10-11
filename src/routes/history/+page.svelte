<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import * as Table from "$lib/components/ui/table";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import { Button } from "$lib/components/ui/button";
    import PageHeader from "$lib/components/page-header.svelte";
    import Panel from "$lib/components/panel.svelte";
    import Search from "@lucide/svelte/icons/search";
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

<main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Past events"
        title={data.year === "unknown" ? "Leaderboard history" : `Leaderboard · ${data.year}`}
        description="Explore the final standings from previous events."
    >
        {#snippet actions()}
            <Button href="/leaderboard" variant="outline">Live leaderboard</Button>
        {/snippet}
    </PageHeader>

    {#if data.evt_archives.length > 0}
        <nav aria-label="Archived event years" class="mb-6 flex flex-wrap items-center gap-2">
            <span class="eyebrow mr-1">Year</span>
            {#each data.evt_archives as evt}
                <a
                    href="/history?year={evt}"
                    aria-current={data.year === evt ? "page" : undefined}
                    class="rounded-full border px-3 py-1.5 font-mono text-sm tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring {data.year === evt ? 'border-brand-green/40 bg-brand-green/10 font-semibold text-brand-green' : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'}"
                >
                    {evt}
                </a>
            {/each}
        </nav>
    {/if}

    {#if data.history}
        <Podium top3={rankedBoard.slice(0, 3)} />

        <Panel title="Rankings" class="mt-4">
            {#snippet actions()}
                <div class="relative">
                    <Search class="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name…"
                        aria-label="Search by name or member"
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
                    {#each filtered as entry (entry.name)}
                        {@const hasMembers = !!entry.members?.length}
                        {@const isOpen = openMembers.has(entry.name)}
                        <Table.Row>
                            <Table.Cell class="py-2.5 pl-4 align-top font-mono text-sm tabular-nums {entry.rank <= 3 ? 'font-semibold text-foreground' : 'text-muted-foreground'}">
                                {entry.rank}
                            </Table.Cell>
                            <Table.Cell class="max-w-0 py-2.5 text-sm text-foreground">
                                {#if hasMembers}
                                    <Collapsible.Root open={isOpen} onOpenChange={() => toggleMembers(entry.name)}>
                                        <Collapsible.Trigger class="flex w-full min-w-0 items-center gap-1.5 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                            <span class="truncate">{entry.name}</span>
                                            <ChevronDown class="size-3.5 shrink-0 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}" />
                                        </Collapsible.Trigger>
                                        <Collapsible.Content class="mt-2 flex flex-wrap gap-1.5">
                                            {#each entry.members ?? [] as member}
                                                <span class="max-w-full truncate rounded-full border border-border bg-background/50 px-2 py-0.5 text-xs text-muted-foreground">
                                                    {member}
                                                </span>
                                            {/each}
                                        </Collapsible.Content>
                                    </Collapsible.Root>
                                {:else}
                                    <span class="block truncate">{entry.name}</span>
                                {/if}
                            </Table.Cell>
                            <Table.Cell class="py-2.5 text-right align-top font-mono text-xs text-muted-foreground tabular-nums">
                                {gapToNext.get(entry.name) ? `−${gapToNext.get(entry.name)!.toLocaleString()}` : gapToNext.has(entry.name) ? "tied" : ""}
                            </Table.Cell>
                            <Table.Cell class="py-2.5 pr-4 text-right align-top font-mono text-sm font-medium text-foreground tabular-nums">
                                {entry.score.toLocaleString()}
                            </Table.Cell>
                        </Table.Row>
                    {:else}
                        <Table.Row class="hover:bg-transparent">
                            <Table.Cell colspan={4} class="py-10 text-center text-sm text-muted-foreground">
                                {rankedBoard.length === 0 ? "No scores were archived for this event." : "No one matches your search."}
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </Panel>
    {:else}
        <Panel title="Archives">
            <div class="px-4 py-10">
                {#if data.year !== "unknown"}
                    <p class="text-sm font-medium text-foreground">No leaderboard found for {data.year}.</p>
                    <p class="mt-1 text-sm text-muted-foreground">{data.evt_archives.length > 0 ? "Choose another year above to view its standings." : "No event leaderboards have been archived yet."}</p>
                {:else if data.evt_archives.length === 0}
                    <p class="text-sm font-medium text-foreground">No archives yet.</p>
                    <p class="mt-1 text-sm text-muted-foreground">Past event standings will appear here once a leaderboard is archived.</p>
                {:else}
                    <p class="text-sm font-medium text-foreground">Choose an event year.</p>
                    <p class="mt-1 text-sm text-muted-foreground">Select a year above to view its final leaderboard.</p>
                {/if}
            </div>
        </Panel>
    {/if}
</main>
