<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ChallengeData } from "$lib/database/db";

    let showArchiveFiles = $state<boolean>(false);
    let showBinFiles = $state<boolean>(false);
    let creationDisabled = $state<boolean>(false);
    let showFlag = $state<boolean>(false);
    let flagValue = $state<string>("");
        
    const { title, action_target, challenge, result, onSubmit, uploaded_files, requireFlag } : {
        title: string,
        action_target: string,
        challenge: ChallengeData | undefined,
        onSubmit?: (data: { success: true; message: string } | { success: false; error: string } | undefined) => void,
        result: { error?: string, success?: boolean, message?: string } | null,
        uploaded_files: {
            archives: string[];
            bins: string[];
        },
        requireFlag: boolean
    } = $props();

    let archiveFiles = $state<string[]>(challenge?.hlinks || []);
    let archiveSearch = $state("");
    let filteredArchives = $derived(
        uploaded_files.archives.filter(file =>
            file.toLowerCase().includes(archiveSearch.toLowerCase())
        )
    );

    let binaryFile = $state<string|undefined>(challenge?.bin_file || undefined);
    let binFileSearch = $state("");
    let filterBinaries = $derived(
        uploaded_files.bins.filter(file =>
            file.toLowerCase().includes(binFileSearch.toLowerCase())
        )
    );

    let hints = $state<string[]>(
        challenge?.hints?.length
            ? [...challenge.hints]
            : [""]
    );

    function addHint() {
        hints.push("");
    }

    function removeHint(index: number) {
        hints.splice(index, 1);

        if (hints.length === 0) {
            hints.push("");
        }
    }
</script>

<div class="container mt-4" style="max-width: 700px;">
    <div style="transform: scale(0.95)" class={`card shadow-sm border-0 rounded-3 ${creationDisabled ? 'opacity-50' : ''}`}>
        <div class="card-body p-4">
            <h4 class="card-title text-center mb-4">{title}</h4>

            <!-- use:enhance allows us to track the result from the form POST -->
            <form method="POST" action={action_target} use:enhance={() => {
                return async ({ result, update }) => {
                    await update();
                    if (result.type === 'success' && result.data) {
                        const data = result.data as {
                            success: boolean;
                            message?: string;
                            error?: string;
                        };
                        onSubmit?.(
                            data.success ? {
                                success: true,
                                message: data.message ?? ''
                            } : {
                                success: false,
                                error: data.error ?? 'An error occurred'
                            }
                        );
                    }
                };
            }}>
                <!-- Challenge Name -->
                <div class="mb-3">
                    <label for="name" class="form-label fw-semibold">Challenge Name</label>
                    <input
                        type="text"
                        class="form-control"
                        name="name" required
                        value={challenge?.name || ""}
                        placeholder="Enter challenge name"
                    />
                </div>

                <!-- Description -->
                <div class="mb-3">
                    <label for="desc" class="form-label fw-semibold">Description</label>
                    <textarea
                        class="form-control"
                        name="description" required
                        value={challenge?.description || ""}
                        style="min-height: 120px; resize: vertical;"
                        placeholder="Enter a short challenge description"
                    ></textarea>
                </div>

                <!-- Author -->
                <div class="mb-3">
                    <label for="author" class="form-label fw-semibold">Written By</label>
                    <input
                        type="text"
                        class="form-control"
                        name="written_by" required
                        value={challenge?.written_by || ""}
                        placeholder="Enter challenge author name"
                    />
                </div>

                <!-- Challenge Files -->
                <div class="mb-3">
                    <label for="attached-files" class="form-label fw-semibold">Challenge Files</label>
                    <hr />

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary mb-2"
                        onclick={() => { showArchiveFiles = !showArchiveFiles }}
                    >
                        {showArchiveFiles ? "Hide Files" : "Show Archives"}
                    </button>

                    {#if showArchiveFiles}
                        <div class="mb-2">
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                placeholder="Search files..."
                                bind:value={archiveSearch}
                            />
                        </div>

                        <div class="border rounded p-2 d-flex flex-wrap gap-2">
                            {#if filteredArchives.length === 0}
                                <p class="text-muted mb-0">
                                    {uploaded_files.archives.length === 0 ? "No files uploaded" : "No files match your search"}
                                </p>
                            {/if}

                            {#each filteredArchives as file}
                                <label
                                    for={`file-${file}`}
                                    class="d-flex align-items-center gap-1 small border rounded px-2 py-1 hover-highlight"
                                >
                                    <input
                                        type="checkbox"
                                        id={`file-${file}`}
                                        name="attached_files"
                                        value={file}
                                        bind:group={archiveFiles}
                                        class="form-check-input m-0"
                                    />
                                    {file}
                                </label>
                            {/each}
                        </div>

                        <hr />
                    {/if}
                </div>

                <!-- Binary Files -->
                <div class="mb-3">
                    <label for="attached-files" class="form-label fw-semibold">Binary Files</label>
                    <hr />

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary mb-2"
                        onclick={() => { showBinFiles = !showBinFiles }}
                    >
                        {showBinFiles ? "Hide Files" : "Show Binaries"}
                    </button>

                    {#if showBinFiles}
                        <div class="mb-2">
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                placeholder="Search files..."
                                bind:value={binFileSearch}
                            />
                        </div>

                        <div class="border rounded p-2 d-flex flex-wrap gap-2">
                            {#if filterBinaries.length === 0}
                                <p class="text-muted mb-0">
                                    {uploaded_files.bins.length === 0 ? "No files uploaded" : "No files match your search"}
                                </p>
                            {/if}

                            {#each filterBinaries as file}
                                <label
                                    for={`file-${file}`}
                                    class="d-flex align-items-center gap-1 small border rounded px-2 py-1 hover-highlight"
                                >
                                    <input
                                        type="radio"
                                        id={`file-${file}`}
                                        name="bin_file"
                                        value={file}
                                        bind:group={binaryFile}
                                        class="form-check-input m-0"
                                    />
                                    {file}
                                </label>
                            {/each}
                        </div>

                        <hr />
                    {/if}
                </div>
                
                <!-- Challenge Hints -->
                <div class="mb-3">
                    <label for="hints" class="form-label fw-semibold">
                        Hints
                    </label>

                    {#each hints as _, index}
                        <div class="input-group mb-2">
                            <input
                                type="text"
                                class="form-control"
                                bind:value={hints[index]}
                                placeholder={`Hint #${index + 1}`}
                            />

                            <button
                                type="button"
                                class="btn btn-outline-danger"
                                onclick={() => removeHint(index)}
                            >
                                Remove
                            </button>
                        </div>
                    {/each}

                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        onclick={addHint}
                    >
                        + Add Hint
                    </button>

                    <!-- Hidden field sent to backend -->
                    <input
                        type="hidden"
                        name="hints"
                        value={JSON.stringify(
                            hints.filter(h => h.trim() !== "")
                        )}
                    />
                </div>

                <!-- Category & Difficulty -->
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="category" class="form-label fw-semibold">Category</label>
                        <select
                            class="form-select"
                            name="category" required
                        >
                            <option value="" disabled>Select Category</option>
                            <option value="Web Exploitation">Web Exploitation</option>
                            <option value="Cryptography">Cryptography</option>
                            <option value="Reverse Engineering">Reverse Engineering</option>
                            <option value="Forensics">Forensics</option>
                            <option value="Steganography">Steganography</option>
                            <option value="Binary Exploitation">Binary Exploitation</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label for="difficulty" class="form-label fw-semibold">Difficulty</label>
                        <select
                            class="form-select"
                            name="difficulty" required
                        >
                            <option value="" disabled>Select difficulty</option>
                            <option value="Simple">Simple</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Extreme">Extreme</option>
                        </select>
                    </div>
                </div>

                <!-- Flag -->
                <div class="mb-3">
                    <label for="flag-value" class="form-label fw-semibold">Flag</label>
                    <div class="input-group">
                        <input
                            id="flag-value"
                            type={ showFlag ? "text" : "password" }
                            class="form-control"
                            name="flag"
                            required={requireFlag}
                            placeholder="Enter flag"
                            autocomplete="off"
                            bind:value={flagValue}
                        />
                        <button
                            type="button"
                            aria-label="showFlagValue"
                            class="btn btn-outline-secondary"
                            onclick={() => { showFlag = !showFlag }}
                        >
                            <i class={showFlag ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                        </button>
                    </div>
                </div>

                <!-- Points (not visible to viewer) -->
                <input
                    type="number"
                    name="points"
                    hidden
                />

                {#if challenge?.id}
                    <!-- need the challenge id in order to update it -->
                    <input
                        type="text"
                        name="id"
                        value={challenge.id}
                        hidden
                    />
                {/if}

                <!-- Submit -->
                <button
                    type="submit"
                    class="btn btn-primary w-100"
                >
                    Submit
                </button>
            </form>
        </div>
    </div>
</div>