<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import * as Card from '$lib/components/ui/card';
    import Trash2 from '@lucide/svelte/icons/trash-2';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function deleteUser(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this player "${name}"?`)) {
            const req = await fetch('/admin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'user', action: 'delete', id })
            });

            const response = await req.json();
            if (response) {
                if (response.success) {
                    success = `Successfully removed ${name}`;
                } else {
                    error = `Failed to remove ${name}`;
                }
            } else {
               error = "Error Occurred";
            }

            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    const { users } = $props();

    // whenever searchTerm is modified filterUsers will be recomputed
    let searchTerm = $state("");
    const filteredUsers = $derived(
        users.filter((user: any) => {
            return user.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );
</script>

<div>
    <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Registered Players</h2>
        </div>

        <Feedback {success} {warning} {error} />

        <Badge variant="secondary">
            {users.length} Player{users.length !== 1 ? 's' : ''}
        </Badge>
    </div>

    <div class="mb-4">
        <Input
            type="text"
            placeholder="Search players by username..."
            bind:value={searchTerm}
        />
    </div>

    <!-- User Cards -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

        {#each filteredUsers as user}
            <Card.Root class="justify-between border-border bg-card p-3 text-sm">
                <!-- Top: Avatar + Username -->
                <div class="mb-2 flex items-center gap-2">
                    <img
                        src={user.image}
                        alt="{user.name}'s avatar"
                        class="h-9 w-9 rounded-full border border-border object-cover"
                        referrerpolicy="no-referrer"
                        crossorigin="anonymous"
                    />
                    <h6 class="truncate text-sm font-bold text-foreground">
                        {user.name}
                    </h6>
                </div>

                <!-- Details -->
                <div class="ml-0.5">
                    <p class="mb-1 text-muted-foreground">
                        <strong class="text-foreground">Email:</strong> {user.email}
                    </p>
                    <p class="text-muted-foreground">
                        <strong class="text-foreground">Team:</strong> {user.team_name || "—"}
                    </p>
                </div>

                <!-- Action -->
                <div class="mt-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        class="w-full"
                        onclick={() => { deleteUser(user.id, user.name) }}
                    >
                        <Trash2 class="h-3.5 w-3.5" />
                        Remove
                    </Button>
                </div>
            </Card.Root>
        {/each}

    </div>
</div>