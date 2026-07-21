<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ChallengeData } from "$lib/database/db";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import Eye from "@lucide/svelte/icons/eye";
    import EyeOff from "@lucide/svelte/icons/eye-off";

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
    let imageRef = $state<string>(challenge?.image_ref || "");
    let webImageRef = $state<string>(challenge?.web_image_ref || "");
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

    const selectClass =
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-base outline-none transition-colors md:text-sm";
    const fileLabelClass =
        "flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:border-brand-green/40 hover:bg-accent";
</script>

<div class="mx-auto mt-8 w-full max-w-[700px] px-4">
    <Card.Root class={`border border-border bg-card ${creationDisabled ? 'opacity-50' : ''}`}>
        <Card.Content>
            <h4 class="mb-4 text-center font-mono text-lg font-bold text-foreground">{title}</h4>

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
                <div class="mb-3 space-y-1.5">
                    <Label for="name" class="font-semibold">Challenge Name</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name" required
                        value={challenge?.name || ""}
                        placeholder="Enter challenge name"
                    />
                </div>

                <!-- Description -->
                <div class="mb-3 space-y-1.5">
                    <Label for="desc" class="font-semibold">Description</Label>
                    <Textarea
                        id="desc"
                        name="description" required
                        value={challenge?.description || ""}
                        class="min-h-[120px] resize-y"
                        placeholder="Enter a short challenge description"
                    ></Textarea>
                </div>

                <!-- Author -->
                <div class="mb-3 space-y-1.5">
                    <Label for="author" class="font-semibold">Written By</Label>
                    <Input
                        type="text"
                        id="author"
                        name="written_by" required
                        value={challenge?.written_by || ""}
                        placeholder="Enter challenge author name"
                    />
                </div>

                <!-- Challenge Files -->
                <div class="mb-3">
                    <Label for="attached-files" class="font-semibold">Challenge Files</Label>
                    <hr class="my-2 border-border" />

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="mb-2"
                        onclick={() => { showArchiveFiles = !showArchiveFiles }}
                    >
                        {showArchiveFiles ? "Hide Files" : "Show Archives"}
                    </Button>

                    {#if showArchiveFiles}
                        <div class="mb-2">
                            <Input
                                type="text"
                                class="h-7 text-xs"
                                placeholder="Search files..."
                                bind:value={archiveSearch}
                            />
                        </div>

                        <div class="flex flex-wrap gap-2 rounded-lg border border-border p-2">
                            {#if filteredArchives.length === 0}
                                <p class="mb-0 text-sm text-muted-foreground">
                                    {uploaded_files.archives.length === 0 ? "No files uploaded" : "No files match your search"}
                                </p>
                            {/if}

                            {#each filteredArchives as file}
                                <label for={`file-${file}`} class={fileLabelClass}>
                                    <input
                                        type="checkbox"
                                        id={`file-${file}`}
                                        name="attached_files"
                                        value={file}
                                        bind:group={archiveFiles}
                                        class="m-0 accent-brand-green"
                                    />
                                    {file}
                                </label>
                            {/each}
                        </div>

                        <hr class="my-2 border-border" />
                    {/if}
                </div>

                <!-- Binary Files -->
                <div class="mb-3">
                    <Label for="attached-files" class="font-semibold">Binary Files</Label>
                    <hr class="my-2 border-border" />

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="mb-2"
                        onclick={() => { showBinFiles = !showBinFiles }}
                    >
                        {showBinFiles ? "Hide Files" : "Show Binaries"}
                    </Button>

                    {#if showBinFiles}
                        <div class="mb-2">
                            <Input
                                type="text"
                                class="h-7 text-xs"
                                placeholder="Search files..."
                                bind:value={binFileSearch}
                            />
                        </div>

                        <div class="flex flex-wrap gap-2 rounded-lg border border-border p-2">
                            {#if filterBinaries.length === 0}
                                <p class="mb-0 text-sm text-muted-foreground">
                                    {uploaded_files.bins.length === 0 ? "No files uploaded" : "No files match your search"}
                                </p>
                            {/if}

                            {#each filterBinaries as file}
                                <label for={`file-${file}`} class={fileLabelClass}>
                                    <input
                                        type="radio"
                                        id={`file-${file}`}
                                        name="bin_file"
                                        value={file}
                                        bind:group={binaryFile}
                                        class="m-0 accent-brand-green"
                                    />
                                    {file}
                                </label>
                            {/each}
                        </div>

                        <hr class="my-2 border-border" />
                    {/if}
                </div>

                <!-- SSH Instance Image -->
                <div class="mb-3 space-y-1.5">
                    <Label for="image-ref" class="font-semibold">SSH Instance Image</Label>
                    <Input
                        type="text"
                        id="image-ref"
                        name="image_ref"
                        bind:value={imageRef}
                        placeholder="e.g. khi-ssh/go1:latest"
                    />
                </div>

                <!-- Web Instance Image -->
                <div class="mb-3">
                    <label for="web-image-ref" class="form-label fw-semibold">Web Instance Image</label>
                    <input
                        id="web-image-ref"
                        type="text"
                        class="form-control"
                        name="web_image_ref"
                        bind:value={webImageRef}
                        placeholder="e.g. khi-web/profilepeek:latest"
                    />
                </div>

                <!-- Challenge Hints -->
                <div class="mb-3">
                    <Label for="hints" class="font-semibold">
                        Hints
                    </Label>

                    {#each hints as _, index}
                        <div class="mb-2 flex gap-2">
                            <Input
                                type="text"
                                bind:value={hints[index]}
                                placeholder={`Hint #${index + 1}`}
                            />

                            <Button
                                type="button"
                                variant="destructive"
                                onclick={() => removeHint(index)}
                            >
                                Remove
                            </Button>
                        </div>
                    {/each}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onclick={addHint}
                    >
                        + Add Hint
                    </Button>

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
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div class="mb-3 space-y-1.5">
                        <Label for="category" class="font-semibold">Category</Label>
                        <select
                            id="category"
                            class={selectClass}
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

                    <div class="mb-3 space-y-1.5">
                        <Label for="difficulty" class="font-semibold">Difficulty</Label>
                        <select
                            id="difficulty"
                            class={selectClass}
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
                <div class="mb-3 space-y-1.5">
                    <Label for="flag-value" class="font-semibold">Flag</Label>
                    <div class="flex gap-2">
                        <Input
                            id="flag-value"
                            type={ showFlag ? "text" : "password" }
                            name="flag"
                            required={requireFlag}
                            placeholder="Enter flag"
                            autocomplete="off"
                            bind:value={flagValue}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="showFlagValue"
                            onclick={() => { showFlag = !showFlag }}
                        >
                            {#if showFlag}
                                <EyeOff class="h-4 w-4" />
                            {:else}
                                <Eye class="h-4 w-4" />
                            {/if}
                        </Button>
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
                <Button
                    type="submit"
                    class="w-full"
                >
                    Submit
                </Button>
            </form>
        </Card.Content>
    </Card.Root>
</div>