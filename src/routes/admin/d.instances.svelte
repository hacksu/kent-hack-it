<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import Feedback from '$lib/components/feedback.svelte';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import * as Table from '$lib/components/ui/table';
    import CircleStop from '@lucide/svelte/icons/circle-stop';
    import RotateCw from '@lucide/svelte/icons/rotate-cw';

    const { instances } = $props();

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
</script>

<div>
    <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Active Instances</h2>
        </div>

        <Feedback {success} warning={""} {error} />

        <Badge variant="secondary">
            {instances.length} Instance{instances.length !== 1 ? 's' : ''}
        </Badge>
    </div>

    {#if instances.length === 0}
        <p class="text-sm text-muted-foreground italic">No active instances.</p>
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
                        <Table.Head>Time Remaining</Table.Head>
                        <Table.Head></Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each instances as instance (`${instance.type}-${instance.uid ?? instance.challenge_id}`)}
                        <Table.Row>
                            <Table.Cell>
                                <Badge variant="outline" class={typeBadgeClass(instance.type)}>{instance.type}</Badge>
                            </Table.Cell>
                            <Table.Cell class="text-foreground">{instance.type === 'web' ? 'Shared' : instance.player_name}</Table.Cell>
                            <Table.Cell class="text-muted-foreground">{instance.challenge_name ?? "—"}</Table.Cell>
                            <Table.Cell class="font-mono text-xs text-muted-foreground">{shortId(instance)}</Table.Cell>
                            <Table.Cell class="font-mono text-xs text-muted-foreground">{instance.port}</Table.Cell>
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
</div>
