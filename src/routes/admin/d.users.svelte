<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import AdminTabHeader from '$lib/components/admin-tab-header.svelte';
    import Panel from '$lib/components/panel.svelte';
    import UserAvatar from '$lib/components/user-avatar.svelte';
    import Search from '@lucide/svelte/icons/search';
    import Trash2 from '@lucide/svelte/icons/trash-2';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function deleteUser(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this player "${name}"?`)) {
            console.log(`${name} : ${id}`);

            const req = await fetch('/admin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'user', action: 'delete', id: id })
            });

            const response = await req.json();
            if (response) {
                if (response.success) {
                    success = `Successfully removed ${name}`;
                } else {
                    error = response.error;
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

<AdminTabHeader title="Registered players" count={searchTerm ? `${filteredUsers.length} / ${users.length}` : users.length}>
    {#snippet actions()}
        <div class="relative w-full sm:w-64">
            <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" class="pl-8" placeholder="Search by username…" aria-label="Search players" bind:value={searchTerm} />
        </div>
    {/snippet}
</AdminTabHeader>

<Feedback {success} {warning} {error} />

<Panel>
    <div class="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_2rem] gap-4 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground md:grid" aria-hidden="true">
        <span>Player</span><span>Email</span><span>Team</span><span></span>
    </div>
    <ul class="divide-y divide-border">
        {#each filteredUsers as user (user.id)}
            <li class="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_2rem]">
                <div class="flex min-w-0 items-center gap-3">
                    <UserAvatar name={user.name} image={user.image} />
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium" title={user.name}>{user.name}</p>
                        <p class="truncate text-xs text-muted-foreground md:hidden" title={user.email}>{user.email}</p>
                        <p class="truncate text-xs text-muted-foreground md:hidden" title={user.team_name}>Team: {user.team_name || '—'}</p>
                    </div>
                </div>
                <span class="hidden truncate text-sm text-muted-foreground md:block" title={user.email}>{user.email}</span>
                <span class="hidden truncate text-sm text-muted-foreground md:block" title={user.team_name}>{user.team_name || '—'}</span>
                <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Remove player {user.name}" title="Remove player {user.name}" onclick={() => { console.log(user); deleteUser(user.id, user.name) }}>
                    <Trash2 />
                </Button>
            </li>
        {:else}
            <li class="px-4 py-10 text-center text-sm text-muted-foreground">{users.length === 0 ? 'No registered players yet.' : 'No players match your search.'}</li>
        {/each}
    </ul>
</Panel>
