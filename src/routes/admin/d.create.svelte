<script lang="ts">
    let files = [];
    let selectedFiles = [];

    let newFormData = {
        name: '',
        description: '',
        category: '',
        difficulty: '',
        written_by: '',
        flag: '',
        points: '',
        files: []
    };

    let isOpen = false;
    let creationDisabled = false;
</script>

<div class="container mt-4" style="max-width: 700px;">
    <div class={`card shadow-sm border-0 rounded-3 ${creationDisabled ? 'opacity-50' : ''}`}>
        <div class="card-body p-4">
            <h4 class="card-title text-center mb-4">Create a New Challenge</h4>

            <form onsubmit={() => {}}>
                <!-- Challenge Name -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Challenge Name</label>
                    <input
                        type="text"
                        class="form-control"
                        name="name"
                        bind:value={newFormData.name}
                        oninput={() => {}}
                        required
                        placeholder="Enter challenge name"
                        disabled={creationDisabled}
                    />
                </div>

                <!-- Description -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Description</label>
                    <textarea
                        class="form-control"
                        name="description"
                        bind:value={newFormData.description}
                        oninput={() => {}}
                        style="min-height: 120px; resize: vertical;"
                        placeholder="Enter a short challenge description"
                        disabled={creationDisabled}
                    />
                </div>

                <!-- Author -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Written By</label>
                    <input
                        type="text"
                        class="form-control"
                        name="written_by"
                        bind:value={newFormData.written_by}
                        oninput={() => {}}
                        required
                        placeholder="Enter challenge author name"
                        disabled={creationDisabled}
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
                        disabled={creationDisabled}
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
                                    checked={newFormData.files.includes(file)}
                                    onclick={() => {}}
                                    disabled={creationDisabled}
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
                            name="category"
                            bind:value={newFormData.category}
                            oninput={() => {}}
                            required
                            disabled={creationDisabled}
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
                            name="difficulty"
                            bind:value={newFormData.difficulty}
                            oninput={() => {}}
                            required
                            disabled={creationDisabled}
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
                        name="flag"
                        bind:value={newFormData.flag}
                        oninput={() => {}}
                        required
                        placeholder="Enter flag"
                        disabled={creationDisabled}
                    />
                </div>

                <!-- Points -->
                <div class="mb-4 text-center">
                    <label class="form-label fw-semibold d-block">Points (Auto-calculated)</label>
                    <input
                        type="number"
                        class="form-control mx-auto"
                        name="points"
                        bind:value={newFormData.points}
                        readonly
                        style="max-width: 150px; background-color: #f8f9fa"
                        placeholder="Select difficulty first"
                        disabled={creationDisabled}
                    />
                </div>

                <!-- Submit -->
                <button
                    type="submit"
                    class="btn btn-primary w-100"
                    disabled={creationDisabled}
                >
                    Submit Challenge
                </button>
            </form>
        </div>
    </div>
</div>