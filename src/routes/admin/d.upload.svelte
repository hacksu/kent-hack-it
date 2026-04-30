<script lang="ts">
    import { enhance } from "$app/forms";
    import { invalidateAll } from '$app/navigation';

    let selectedFiles = $state<File[]>([]);
    let fileInput = $state<HTMLInputElement | null>(null);

    let uploadsDisabled = $state(false);
    let uploading = $state(false);

    function clearResult() {
        error = warning = success = "";
    }

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    function handleFileInput(e: Event) {
        const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);

        const invalid = picked.filter(f => !f.name.endsWith(".zip"));
        if (invalid.length > 0) {
            error = `Only .zip files are allowed: ${invalid.map(f => f.name).join(", ")}`;
            input.value = "";
            selectedFiles = [];
            return;
        }

        const tooBig = picked.filter(f => f.size > MAX_FILE_SIZE);
        if (tooBig.length > 0) {
            error = `Files exceed 12 MB limit: ${tooBig.map(f => f.name).join(", ")}`;
            if (fileInput) fileInput.value = "";
            selectedFiles = [];
            return;
        }

        error = "";
        selectedFiles = picked;
    }

    async function handleDelete(filename: string) {
        if (window.confirm(`Are you sure you want to DELETE this file "${filename}"?`)) {
            const req = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: 'file', action: 'delete', file: filename })
            });

            const response = await req.json();
            if (response) {
                if (response.success) {
                    success = `Successfully Deleted ${filename}`;
                } else {
                    error = `Failed to Delete ${filename}`;
                }
            } else {
               error = "Error Occurred";
            }
            
            await invalidateAll();
            setTimeout(clearResult, 5000);
        }
    }

    const { uploaded_files } = $props();
</script>

<div class="container">
    <p>Upload Compressed CTF Challenge Files (zip)</p>

    {#if uploadsDisabled}
        <div class="alert alert-warning text-center mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Uploads Disabled:</strong> File uploads are currently disabled during the event.
        </div>
    {/if}

    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class={`card shadow ${uploadsDisabled ? 'opacity-50' : ''}`}>
                <div class="card-body">
                    <h3 class="card-title text-center mb-4">Upload Challenge</h3>

                    <!-- button fetch -->
                    {#if error}
                        <div class="alert alert-danger">{error}</div>
                    {/if}
                    {#if success}
                        <div class="alert alert-success">{success}</div>
                    {/if}
                    {#if warning}
                        <div class="alert alert-warning">{warning}</div>
                    {/if}

                    <form
                        method="POST"
                        enctype="multipart/form-data"
                        action="?/upload_files"
                        use:enhance={() => {
                        return async ({ result, update }) => {
                            await update();
                            selectedFiles = [];
                            
                            if (fileInput) {
                                fileInput.value = "";
                            }

                            if (result.type === 'success') {
                                if (!result.data?.warning) {
                                    success = "Files Uploaded!";
                                } else {
                                    warning = result.data.warning;
                                }
                                setTimeout(clearResult, 5000);
                            } else {
                                error = "Error Occurred!";
                                setTimeout(clearResult, 5000);
                            }
                        };
                    }}>
                        <div class="mb-3">
                            <input
                                name="challenge_archives"
                                type="file"
                                class="form-control"
                                accept=".zip"
                                multiple
                                oninput={handleFileInput}
                                disabled={uploadsDisabled || uploading}
                                bind:this={fileInput}
                            />

                            {#if selectedFiles.length > 0}
                                <small class="form-text text-muted mt-2">
                                    Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}:
                                    {selectedFiles.map(f => f.name).join(', ')}
                                </small>
                            {/if}
                        </div>

                        <div class="d-grid">
                            <button
                                type="submit"
                                class="btn btn-primary"
                                disabled={uploadsDisabled || selectedFiles.length === 0 || uploading}
                            >
                                {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}` : ''}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .custom-hover-dark {
        transition: color 0.2s ease-in-out, transform 0.2s ease-in-out, font-weight 0.2s ease-in-out;
    }
    .custom-hover-dark:hover {
        color: rgb(36, 34, 34) !important;
        transform: scale(1.15);
    }
</style>

<div class="container mt-2">
    <h3 style="padding: 5px;">Current Uploads</h3>
    <div class="row justify-content-center">
        <ul class="list-group w-auto">
            {#each uploaded_files as file}
                <li
                    class="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                    style="font-size: 0.9rem; min-width: 300px; max-width: 600px;"
                >
                    <a
                        href={`/api/download/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-decoration-none text-muted flex-grow-1 custom-hover-dark"
                        style="margin-right: 1rem;"
                    >
                        {file}
                    </a>

                    <button class="btn btn-sm btn-outline-danger flex-shrink-0" onclick={() => handleDelete(file)}>
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </li>
            {/each}
        </ul>
        <div style="padding-bottom: 4rem;"></div>
    </div>
</div>