<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    import Feedback from '$lib/components/feedback.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as Table from '$lib/components/ui/table';
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
                    error = `Failed to remove ${name}`;
                }
            } else {
               error = "Error Occurred";
            }

            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    const { admins } = $props();
</script>

<div>
    <div class="mb-4 flex items-center gap-2.5">
        <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
        <h2 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Current Admins</h2>
    </div>

    <Feedback {success} {warning} {error} />

    <div class="overflow-hidden rounded-xl border border-border">
        <Table.Root>
            <Table.Header>
                <Table.Row class="hover:bg-transparent">
                    <Table.Head>Admin</Table.Head>
                    <Table.Head class="w-24 text-right">Actions</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each admins as admin, index (index)}
                    <Table.Row>
                        <Table.Cell>
                            <div class="flex items-center gap-3">
                                <img
                                    src={admin.image}
                                    alt="{admin.name}'s avatar"
                                    class="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                                    referrerpolicy="no-referrer"
                                    crossorigin="anonymous"
                                />
                                <span class="font-medium text-foreground">{admin.name}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell class="text-right">
                            <!--
                                when admins are removed
                                the logout button does
                                not update to show login
                            -->
                            <Button
                                variant="destructive"
                                size="sm"
                                onclick={() => { deleteAdmin(admin.id, admin.name) }}
                            >
                                <Trash2 class="h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
</div>