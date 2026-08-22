<script lang="ts">
    import type { LogEntry } from '$lib/parse_log';

    import { Input } from '$lib/components/ui/input';
    import * as Select from '$lib/components/ui/select';
    import * as Table from '$lib/components/ui/table';
    import ArrowUp from '@lucide/svelte/icons/arrow-up';
    import ArrowDown from '@lucide/svelte/icons/arrow-down';
    import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';

    const { entries }: { entries: LogEntry[] } = $props();

    let search = $state('');

    let uaFilter = $state('all');
    const userAgents = $derived(['all', ...new Set(entries.map(e => e.userAgent))]);

    let methodFilter = $state('all');
    let statusFilter = $state('all');
    let minRt = $state('');
    let maxRt = $state('');
    let sortKey = $state<keyof LogEntry>('time');
    let sortDir = $state<'asc' | 'desc'>('desc');

    const methods = $derived(['all', ...new Set(entries.map(e => e.method))]);
    const statusGroups = ['all', '2xx', '3xx', '4xx', '5xx'];

    function matchesStatus(status: number) {
        if (statusFilter === 'all') return true;
        const prefix = parseInt(statusFilter[0]);
        return Math.floor(status / 100) === prefix;
    }

    let filtered = $derived(entries
        .filter(e => {
            if (search && !e.uri.toLowerCase().includes(search.toLowerCase()) &&
                        !e.ip.includes(search)) return false;
            if (methodFilter !== 'all' && e.method !== methodFilter) return false;
            if (!matchesStatus(e.status)) return false;
            if (minRt !== '' && e.requestTime < parseFloat(minRt)) return false;
            if (maxRt !== '' && e.requestTime > parseFloat(maxRt)) return false;
            if (uaFilter !== 'all' && e.userAgent !== uaFilter) return false;
            return true;
        })
        .sort((a, b) => {
            const av = a[sortKey], bv = b[sortKey];
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        })
    );

    function toggleSort(key: keyof LogEntry) {
        if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortKey = key; sortDir = 'desc'; }
    }

    function statusClass(status: number) {
        if (status < 300) return 'text-brand-green';
        if (status < 400) return 'text-brand-blue';
        if (status < 500) return 'text-amber-500';
        return 'text-destructive';
    }

    function methodClass(method: string) {
        return {
            get: 'text-brand-blue',
            post: 'text-brand-green',
            put: 'text-amber-500',
            delete: 'text-destructive',
            patch: 'text-purple-400',
        }[method.toLowerCase()] ?? 'text-foreground';
    }

    function formatBytes(n: number) {
        if (n < 1024) return `${n} B`;
        if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / 1024 ** 2).toFixed(1)} MB`;
    }

    const columns: [keyof LogEntry, string][] = [
        ['time',        'Time'],
        ['ip',          'IP'],
        ['method',      'Method'],
        ['uri',         'URI'],
        ['status',      'Status'],
        ['bytesSent',   'Size'],
        ['requestTime', 'RT (s)'],
    ];
</script>

<div class="flex max-h-[75dvh] flex-col overflow-hidden text-sm">
    <!-- filters -->
    <div class="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-border pb-3">
        <Input
            class="min-w-[11rem] flex-1"
            placeholder="Search IP or URI…"
            bind:value={search}
        />

        <Select.Root type="single" bind:value={methodFilter}>
            <Select.Trigger class="w-36 text-muted-foreground">
                {methodFilter === 'all' ? 'All methods' : methodFilter}
            </Select.Trigger>
            <Select.Content>
                {#each methods as m}
                    <Select.Item value={m}>{m === 'all' ? 'All methods' : m}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <Select.Root type="single" bind:value={statusFilter}>
            <Select.Trigger class="w-32 text-muted-foreground">
                {statusFilter === 'all' ? 'All status' : statusFilter}
            </Select.Trigger>
            <Select.Content>
                {#each statusGroups as s}
                    <Select.Item value={s}>{s === 'all' ? 'All status' : s}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <div class="flex items-center gap-1">
            <Input class="w-20 inputText" type="number" placeholder="Min RT" bind:value={minRt} min="0" step="0.001" />
            <span class="text-muted-foreground">–</span>
            <Input class="w-20 inputText" type="number" placeholder="Max RT" bind:value={maxRt} min="0" step="0.001" />
            <span class="text-xs text-muted-foreground">s</span>
        </div>

        <Select.Root type="single" bind:value={uaFilter}>
            <Select.Trigger class="w-40 text-muted-foreground">
                {uaFilter === 'all' ? 'All agents' : uaFilter}
            </Select.Trigger>
            <Select.Content>
                {#each userAgents as ua}
                    <Select.Item value={ua}>{ua === 'all' ? 'All agents' : ua}</Select.Item>
                {/each}
            </Select.Content>
        </Select.Root>

        <span class="ml-auto font-mono text-xs text-muted-foreground tabular-nums">{filtered.length} / {entries.length}</span>
    </div>

    <!-- table -->
    <div class="flex-1 overflow-auto">
        <Table.Root>
            <Table.Header class="sticky top-0 z-10 bg-card">
                <Table.Row class="hover:bg-transparent">
                    {#each columns as [key, label]}
                        <Table.Head
                            class="cursor-pointer text-xs whitespace-nowrap select-none {sortKey === key ? 'text-foreground' : ''}"
                            onclick={() => toggleSort(key)}
                        >
                            <span class="inline-flex items-center gap-1">
                                {label}
                                {#if sortKey === key}
                                    {#if sortDir === 'asc'}
                                        <ArrowUp class="h-3 w-3" />
                                    {:else}
                                        <ArrowDown class="h-3 w-3" />
                                    {/if}
                                {:else}
                                    <ArrowUpDown class="h-3 w-3 opacity-50" />
                                {/if}
                            </span>
                        </Table.Head>
                    {/each}
                    <Table.Head class="text-xs whitespace-nowrap">User agent</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each filtered as e}
                    <Table.Row>
                        <Table.Cell class="font-mono text-xs whitespace-nowrap">{e.time}</Table.Cell>
                        <Table.Cell class="font-mono text-xs whitespace-nowrap">{e.ip}</Table.Cell>
                        <Table.Cell class="font-mono text-xs whitespace-nowrap {methodClass(e.method)}">{e.method}</Table.Cell>
                        <Table.Cell class="max-w-[16rem] p-0">
                            <div class="overflow-x-auto px-2 py-1.5 font-mono text-xs whitespace-nowrap" title={e.uri}>{e.uri}</div>
                        </Table.Cell>
                        <Table.Cell class="font-mono text-xs whitespace-nowrap {statusClass(e.status)}">{e.status}</Table.Cell>
                        <Table.Cell class="font-mono text-xs whitespace-nowrap">{formatBytes(e.bytesSent)}</Table.Cell>
                        <Table.Cell class="font-mono text-xs whitespace-nowrap">{e.requestTime.toFixed(3)}</Table.Cell>
                        <Table.Cell class="max-w-[12.5rem] overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted-foreground" title={e.userAgent}>{e.userAgent}</Table.Cell>
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={8} class="py-8 text-center text-muted-foreground">No entries match the current filters.</Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
</div>
