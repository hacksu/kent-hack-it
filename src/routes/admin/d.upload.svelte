<script lang="ts">
    let selectedFiles = [];
    let files = [];
    let uploadsDisabled = false;
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
                    <div id="msg_popup"></div>

                    <form onsubmit={() => {}}>
                        <div class="mb-3">
                            <input
                                type="file"
                                class="form-control"
                                accept=".zip"
                                multiple
                                oninput={() => {}}
                                disabled={uploadsDisabled}
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
                                disabled={uploadsDisabled || selectedFiles.length === 0}
                            >
                                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}` : ''}
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
            {#each files as file, index}
                <li
                    class="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                    style="font-size: 0.9rem; min-width: 300px; max-width: 600px;"
                >
                    <a
                        href={`/api/ctf/download/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-decoration-none text-muted flex-grow-1 custom-hover-dark"
                        style="margin-right: 1rem;"
                    >
                        {file}
                    </a>

                    <button class="btn btn-sm btn-outline-danger flex-shrink-0" onclick={() => {}}>
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </li>
            {/each}
        </ul>
        <div style="padding-bottom: 4rem;"></div>
    </div>
</div>