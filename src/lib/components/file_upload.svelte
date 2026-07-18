<script lang="ts">
    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities";
    import { enhance } from "$app/forms";

    let {
        summaryText,
        cardTitle,
        formAction,
        fieldName,
        zip_only = true,
        uploadsDisabled = false,
        uploaded_files
    }: {
        summaryText: string;
        cardTitle: string;
        formAction: string;
        fieldName: string;
        zip_only?: boolean;
        uploadsDisabled?: boolean;
        uploaded_files: string[];
    } = $props();

    let selectedFiles = $state<File[]>([]);
    let fileInput = $state<HTMLInputElement | null>(null);
    let uploading = $state(false);

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    function clearResult() {
        error = warning = success = "";
    }

    function handleFileInput(e: Event) {
        const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);

        
        if (zip_only) {
            const invalid = picked.filter(f => !f.name.endsWith(".zip"));
            if (invalid.length > 0) {
                error = `Only .zip files are allowed: ${invalid.map(f => f.name).join(", ")}`;
                input.value = "";
                selectedFiles = [];
                return;
            }
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

            setTimeout(clearResult, 5000);
        }
    }
</script>

<details>
    <summary>{summaryText}</summary>
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class={`card shadow ${uploadsDisabled ? 'opacity-50' : ''}`}>
                <div class="card-body">
                    <h3 class="card-title text-center mb-4">{cardTitle}</h3>

                    <Feedback success={success} warning={warning} error={error} />

                    <form
                        method="POST"
                        enctype="multipart/form-data"
                        action={formAction}
                        use:enhance={() => {
                            return async ({ result, update }) => {
                                await update();
                                selectedFiles = [];

                                if (fileInput) {
                                    fileInput.value = "";
                                }

                                const formResult = await handleFormResult(result);
                                success = formResult.success;
                                warning = formResult.warning;
                                error = formResult.error;

                                setTimeout(clearResult, 5000);
                            };
                        }}
                    >
                        <div class="mb-3">
                            <input
                                name={fieldName}
                                type="file"
                                class="form-control"
                                accept={zip_only ? ".zip" : ""}
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
                            href={`/api/download/${file}?t=${ zip_only ? "archive" : "bin" }`}
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
</details>

<style>
    .custom-hover-dark {
        transition: color 0.2s ease-in-out, transform 0.2s ease-in-out, font-weight 0.2s ease-in-out;
    }
    .custom-hover-dark:hover {
        color: rgb(36, 34, 34) !important;
        transform: scale(1.15);
    }
</style>