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

    async function deleteAdmin(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this admin "${name}"?`)) {
            const req = await fetch('/admin/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'admin', action: 'delete', id: id })
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

    const { admins } = $props();
    let searchTerm = $state("");
    const filteredAdmins = $derived(admins.filter((admin: any) => admin.name.toLowerCase().includes(searchTerm.toLowerCase())));
</script>

<AdminTabHeader title="Administrators" count={searchTerm ? `${filteredAdmins.length} / ${admins.length}` : admins.length}>
    {#snippet actions()}
        <div class="relative w-full sm:w-64">
            <Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" class="pl-8" placeholder="Search by name…" aria-label="Search administrators" bind:value={searchTerm} />
        </div>
    {/snippet}
</AdminTabHeader>

<Feedback {success} {warning} {error} />

<Panel>
    <ul class="divide-y divide-border">
        {#each filteredAdmins as admin, index (index)}
            <li class="flex items-center gap-3 px-4 py-3">
                <UserAvatar name={admin.name} image={admin.image} />
                <span class="min-w-0 flex-1 truncate text-sm font-medium" title={admin.name}>{admin.name}</span>
                <Button variant="ghost" size="icon-sm" class="text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Remove administrator {admin.name}" title="Remove administrator {admin.name}" onclick={() => { deleteAdmin(admin.id, admin.name) }}>
                    <Trash2 />
                </Button>
            </li>
        {:else}
            <li class="px-4 py-10 text-center text-sm text-muted-foreground">{admins.length === 0 ? 'No administrators found.' : 'No administrators match your search.'}</li>
        {/each}
    </ul>
</Panel>
