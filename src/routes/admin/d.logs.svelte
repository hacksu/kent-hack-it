<script lang="ts">
    import type { LogEntry } from '$lib/parse-log';

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
        if (status < 300) return 'success';
        if (status < 400) return 'redirect';
        if (status < 500) return 'client-err';
        return 'server-err';
    }

    function formatBytes(n: number) {
        if (n < 1024) return `${n} B`;
        if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / 1024 ** 2).toFixed(1)} MB`;
    }
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/logsearch.css">
</svelte:head>

<div class="log-wrap">
    <!-- filters -->
    <div class="filters">
        <input
            class="search"
            placeholder="Search IP or URI…"
            bind:value={search}
        />

        <select bind:value={methodFilter}>
            {#each methods as m}
                <option value={m}>{m === 'all' ? 'All methods' : m}</option>
            {/each}
        </select>

        <select bind:value={statusFilter}>
            {#each statusGroups as s}
                <option value={s}>{s === 'all' ? 'All status' : s}</option>
            {/each}
        </select>

        <div class="rt-range">
            <input type="number" placeholder="Min RT" bind:value={minRt} min="0" step="0.001" />
            <span>–</span>
            <input type="number" placeholder="Max RT" bind:value={maxRt} min="0" step="0.001" />
            <span class="rt-label">s</span>
        </div>

        <span class="count">{filtered.length} / {entries.length}</span>

        <div>
            <select bind:value={uaFilter}>
                {#each userAgents as ua}
                    <option value={ua}>{ua === 'all' ? 'All agents' : ua}</option>
                {/each}
            </select>
        </div>

    </div>

    <!-- table -->
    <div class="table-scroll">
        <table>
            <thead>
                <tr>
                    {#each [
                        ['time',        'Time'],
                        ['ip',          'IP'],
                        ['method',      'Method'],
                        ['uri',         'URI'],
                        ['status',      'Status'],
                        ['bytesSent',   'Size'],
                        ['requestTime', 'RT (s)'],
                    ] as [key, label]}
                        <th
                            class="sortable {sortKey === key ? 'active' : ''}"
                            onclick={() => toggleSort(key as keyof LogEntry)}
                        >
                            {label}
                            <span class="sort-icon">
                                {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                            </span>
                        </th>
                    {/each}
                    <th>User agent</th>
                </tr>
            </thead>
            <tbody>
                {#each filtered as e}
                    <tr>
                        <td class="mono nowrap">{e.time}</td>
                        <td class="mono nowrap">{e.ip}</td>
                        <td class="mono method {e.method.toLowerCase()}">{e.method}</td>
                        <td class="mono uri-cell">
                            <div class="uri-scroll" title={e.uri}>{e.uri}</div>
                        </td>
                        <td class="mono status {statusClass(e.status)}">{e.status}</td>
                        <td class="mono nowrap">{formatBytes(e.bytesSent)}</td>
                        <td class="mono nowrap">{e.requestTime.toFixed(3)}</td>
                        <td class="ua" title={e.userAgent}>{e.userAgent}</td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="8" class="empty">No entries match the current filters.</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>