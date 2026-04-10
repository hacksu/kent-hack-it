<script lang="ts">
    import type { ChallengeData } from "$lib/database/db";

    let files = [];
    let isOpen = false;
    let creationDisabled = false;
    
    let selectedFiles = [];

    const { title, action_target, challenge } : {
        title: string,
        action_target: string,
        challenge: ChallengeData|undefined
    } = $props();
    
</script>

<div class="container mt-4" style="max-width: 700px;">
    <div style="transform: scale(0.95)" class={`card shadow-sm border-0 rounded-3 ${creationDisabled ? 'opacity-50' : ''}`}>
        <div class="card-body p-4">
            <h4 class="card-title text-center mb-4">{title}</h4>

            <form method="POST" action={action_target}>
                <!-- Challenge Name -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Challenge Name</label>
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
                    <label class="form-label fw-semibold">Description</label>
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
                    <label class="form-label fw-semibold">Written By</label>
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
                    <label class="form-label fw-semibold">Challenge Files</label>
                    <hr />

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary mb-2"
                        onclick={() => { isOpen = !isOpen }}
                    >
                        {isOpen ? "Hide Files" : "Show Files"}
                    </button>

                    {#if isOpen}
                    <div class="border rounded p-2 d-flex flex-wrap gap-2">
                        {#if files.length === 0}
                            <p class="text-muted mb-0">No files uploaded</p>
                        {/if}

                        {#each files as file}
                            <label
                                for={`file-${file}`}
                                class="d-flex align-items-center gap-1 small border rounded px-2 py-1 hover-highlight"
                            >
                                <input
                                    type="checkbox"
                                    id={`file-${file}`}
                                    class="form-check-input m-0"
                                />
                                {file}
                            </label>
                        {/each}
                    </div>
                    {/if}

                    <hr />
                </div>

                <!-- Category & Difficulty -->
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label fw-semibold">Category</label>
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
                        <label class="form-label fw-semibold">Difficulty</label>
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
                    <label class="form-label fw-semibold">Flag</label>
                    <input
                        type="text"
                        class="form-control"
                        name="flag" required
                        value={challenge?.flag || ""}
                        placeholder="Enter flag"
                    />
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