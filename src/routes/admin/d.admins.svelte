<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    
    import Feedback from '$lib/components/feedback.svelte';

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    async function deleteAdmin(id: string, name: string) {
        if (window.confirm(`Are you sure you want to DELETE this admin "${name}"?`)) {
            const req = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'admin', action: 'delete', id })
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

<div class="container mt-4 d-flex justify-content-center align-items-center">
    <div class="row w-100 justify-content-center">
        <h4>Current Admins</h4>

        <!-- button fetch -->
        <Feedback success={success} warning={warning} error={error}  />

        <ul class="list-group w-auto">
            {#each admins as admin, index (index)}
                <li
                    class="list-group-item d-flex align-items-center px-3 py-2"
                    style="font-size: 1rem; min-width: 250px; max-width: 400px;"
                >
                    <!-- Avatar + Username -->
                    <div class="d-flex align-items-center flex-grow-1">
                        <img
                            src={admin.image}
                            alt="{admin.name}'s avatar"
                            class="rounded-circle me-3"
                            style="width: 40px; height: 40px; object-fit: cover;"
                        />
                        <span class="fw-semibold text-dark">{admin.name}</span>
                    </div>

                    <!-- Delete Button -->
                     
                    <!--
                        when admins are removed
                        the logout button does
                        not update to show login
                    -->
                    <button
                        class="btn btn-sm btn-outline-danger ms-3"
                        onclick={() => { deleteAdmin(admin.id, admin.name) }}
                    >
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </li>
            {/each}
        </ul>
    </div>
</div>