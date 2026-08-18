<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import Feedback from '$lib/components/feedback.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import * as Table from '$lib/components/ui/table';
    import CircleStop from '@lucide/svelte/icons/circle-stop';
    import RotateCw from '@lucide/svelte/icons/rotate-cw';
    import Play from '@lucide/svelte/icons/play';

    const { instances, challenges } = $props();

    let notRunningWeb = $derived.by(() => {
        const activeWebIds = new Set(
            instances.filter((i: any) => i.type === 'web').map((i: any) => i.challenge_id)
        );
        return (challenges ?? []).filter((c: any) => c.web_image_ref && !activeWebIds.has(c.id));
    });

    let debugCandidates = $derived.by(() => {
        const candidates: { key: string; cid: number; type: 'nc' | 'ssh'; label: string }[] = [];
        for (const c of challenges ?? []) {
            if (c.nsjail_conf) candidates.push({ key: `nc:${c.id}`, cid: c.id, type: 'nc', label: `[NC] ${c.name}` });
            if (c.image_ref) candidates.push({ key: `ssh:${c.id}`, cid: c.id, type: 'ssh', label: `[SSH] ${c.name}` });
        }
        return candidates;
    });

    let selectedDebugKey = $state("");

    const TYPES = ['nc', 'ssh', 'web'] as const;
    let activeTypes = $state<Set<string>>(new Set(TYPES));

    function toggleType(type: string) {
        const next = new Set(activeTypes);
        if (next.has(type)) {
            next.delete(type);
        } else {
            next.add(type);
        }
        activeTypes = next;
    }

    let typeCounts = $derived(
        Object.fromEntries(TYPES.map(t => [t, instances.filter((i: any) => i.type === t).length]))
    );

    let filteredInstances = $derived(
        instances.filter((i: any) => activeTypes.has(i.type))
    );

    function chipClass(type: string) {
        const active = activeTypes.has(type);
        const colors: Record<string, string> = {
            nc: active
                ? 'border-brand-green/40 bg-brand-green/10 text-brand-green'
                : 'border-border text-muted-foreground hover:border-brand-green/30 hover:text-brand-green',
            ssh: active
                ? 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue'
                : 'border-border text-muted-foreground hover:border-brand-blue/30 hover:text-brand-blue',
            web: active
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                : 'border-border text-muted-foreground hover:border-amber-500/30 hover:text-amber-500',
        };
        return colors[type];
    }

    const NC_SESSION_MINUTES = 15;

    function timeRemaining(instance: any): string {
        if (instance.type === 'web') return "Persistent";

        const expiresAt = instance.type === 'ssh'
            ? new Date(instance.expires_at).getTime()
            : new Date(instance.created_at).getTime() + NC_SESSION_MINUTES * 60 * 1000;
        const remainingMs = expiresAt - Date.now();
        if (remainingMs <= 0) return "expired";

        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function shortId(instance: any): string {
        return (instance.type === 'ssh' || instance.type === 'web')
            ? instance.container_id.slice(0, 12)
            : instance.cpid;
    }

    function typeBadgeClass(type: string) {
        if (type === 'ssh') return 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue';
        if (type === 'web') return 'border-amber-500/40 bg-amber-500/10 text-amber-500';
        return 'border-brand-green/40 bg-brand-green/10 text-brand-green';
    }

    function clearResult() {
        error = success = "";
    }

    let error = $state("");
    let success = $state("");

    async function stopInstance(instance: any) {
        const label = instance.type === 'web'
            ? `the "${instance.challenge_name}" web instance`
            : `${instance.player_name}'s instance`;

        if (!window.confirm(`Are you sure you want to STOP ${label}?`)) return;

        const body = instance.type === 'web'
            ? { context: 'instance', action: 'stop', type: 'web', cid: instance.challenge_id }
            : { context: 'instance', action: 'stop', type: instance.type, uid: instance.uid };

        const req = await fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const response = await req.json();
        if (response?.success) {
            success = `Stopped ${label}`;
        } else {
            error = response?.error ?? "Failed to stop instance";
        }

        await invalidateAll();
        setTimeout(clearResult, 5000);
    }

    async function restartInstance(instance: any) {
        if (!window.confirm(`Restart the "${instance.challenge_name}" web instance? Players will briefly lose access.`)) return;

        const req = await fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: 'instance', action: 'restart', type: 'web', cid: instance.challenge_id })
        });

        const response = await req.json();
        if (response?.success) {
            success = `Restarted the "${instance.challenge_name}" web instance`;
        } else {
            error = response?.error ?? "Failed to restart instance";
        }

        await invalidateAll();
        setTimeout(clearResult, 5000);
    }

    async function startInstance(challenge: any) {
        if (!window.confirm(`Start the "${challenge.name}" web instance?`)) return;

        const req = await fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: 'instance', action: 'start', type: 'web', cid: challenge.id })
        });

        const response = await req.json();
        if (response?.success) {
            success = `Started the "${challenge.name}" web instance`;
        } else {
            error = response?.error ?? "Failed to start instance";
        }

        await invalidateAll();
        setTimeout(clearResult, 5000);
    }

    async function startDebugInstance() {
        const candidate = debugCandidates.find((c: any) => c.key === selectedDebugKey);
        if (!candidate) return;

        if (!window.confirm(
            `Start a ${candidate.type.toUpperCase()} debug instance for "${candidate.label}" as yourself? ` +
            `This will replace any ${candidate.type.toUpperCase()} instance you currently have running.`
        )) return;

        const req = await fetch('/admin/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: 'instance', action: 'start', type: candidate.type, cid: candidate.cid })
        });

        const response = await req.json();
        if (response?.success) {
            const details = candidate.type === 'ssh'
                ? `port ${response.port}, password ${response.password}`
                : `port ${response.port}`;
            success = `Started ${candidate.label} (${details})`;
        } else {
            error = response?.error ?? response?.message ?? "Failed to start debug instance";
        }

        await invalidateAll();
        setTimeout(clearResult, 5000);
    }
</script>

<div>
    <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Active Instances</h2>
        </div>

        <Feedback {success} warning={""} {error} />

        <Badge variant="secondary">
            {filteredInstances.length}{activeTypes.size < TYPES.length ? ` / ${instances.length}` : ''} Instance{filteredInstances.length !== 1 ? 's' : ''}
        </Badge>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
        {#each TYPES as type}
            <button
                type="button"
                class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors {chipClass(type)}"
                aria-pressed={activeTypes.has(type)}
                onclick={() => toggleType(type)}
            >
                {type}
                <span class="text-[0.65rem] tabular-nums opacity-70">{typeCounts[type]}</span>
            </button>
        {/each}
    </div>

    {#if instances.length === 0}
        <p class="text-sm text-muted-foreground italic">No active instances.</p>
    {:else if filteredInstances.length === 0}
        <p class="text-sm text-muted-foreground italic">No instances match the current filter.</p>
    {:else}
        <div class="overflow-x-auto rounded-lg border border-border">
            <Table.Root>
                <Table.Header>
                    <Table.Row class="hover:bg-transparent">
                        <Table.Head>Type</Table.Head>
                        <Table.Head>Player</Table.Head>
                        <Table.Head>Challenge</Table.Head>
                        <Table.Head>ID</Table.Head>
                        <Table.Head>Port</Table.Head>
                        <Table.Head>Password</Table.Head>
                        <Table.Head>Time Remaining</Table.Head>
                        <Table.Head></Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each filteredInstances as instance (`${instance.type}-${instance.uid ?? instance.challenge_id}`)}
                        <Table.Row>
                            <Table.Cell>
                                <Badge variant="outline" class={typeBadgeClass(instance.type)}>{instance.type}</Badge>
                            </Table.Cell>
                            <Table.Cell class="text-foreground">{instance.type === 'web' ? 'Shared' : instance.player_name}</Table.Cell>
                            <Table.Cell class="text-muted-foreground">{instance.challenge_name ?? "—"}</Table.Cell>
                            <Table.Cell class="font-mono text-xs text-muted-foreground">{shortId(instance)}</Table.Cell>
                            <Table.Cell class="font-mono text-xs text-muted-foreground">{instance.port}</Table.Cell>
                            <Table.Cell class="font-mono text-xs text-muted-foreground select-all">{instance.type === 'ssh' ? instance.password : "—"}</Table.Cell>
                            <Table.Cell class="font-mono text-xs {timeRemaining(instance) === 'expired' ? 'text-destructive' : 'text-foreground'}">
                                {timeRemaining(instance)}
                            </Table.Cell>
                            <Table.Cell class="text-right">
                                <div class="flex justify-end gap-2">
                                    {#if instance.type === 'web'}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onclick={() => restartInstance(instance)}
                                        >
                                            <RotateCw class="h-3.5 w-3.5" />
                                            Restart
                                        </Button>
                                    {/if}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onclick={() => stopInstance(instance)}
                                    >
                                        <CircleStop class="h-3.5 w-3.5" />
                                        Stop
                                    </Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    {/if}

    {#if notRunningWeb.length > 0}
        <div class="mt-6 mb-3 flex items-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Not Running (Web)</h2>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
            <Table.Root>
                <Table.Header>
                    <Table.Row class="hover:bg-transparent">
                        <Table.Head>Challenge</Table.Head>
                        <Table.Head>Status</Table.Head>
                        <Table.Head></Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each notRunningWeb as challenge (challenge.id)}
                        <Table.Row>
                            <Table.Cell class="text-foreground">{challenge.name}</Table.Cell>
                            <Table.Cell>
                                <Badge variant={challenge.is_active ? "secondary" : "outline"}>
                                    {challenge.is_active ? "Active, no instance" : "Disabled"}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell class="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onclick={() => startInstance(challenge)}
                                >
                                    <Play class="h-3.5 w-3.5" />
                                    Start
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    {/if}

    {#if debugCandidates.length > 0}
        <div class="mt-6 mb-3 flex items-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Debug Instance (NC / SSH)</h2>
        </div>

        <div class="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
            <select
                bind:value={selectedDebugKey}
                class="min-w-64 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground"
            >
                <option value="" disabled>Select a challenge to start as yourself...</option>
                {#each debugCandidates as candidate (candidate.key)}
                    <option value={candidate.key}>{candidate.label}</option>
                {/each}
            </select>
            <Button
                variant="outline"
                size="sm"
                disabled={!selectedDebugKey}
                onclick={startDebugInstance}
            >
                <Play class="h-3.5 w-3.5" />
                Start
            </Button>
        </div>
    {/if}
</div>
