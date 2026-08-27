<script lang="ts">
    import { enhance } from "$app/forms";
    import { untrack } from "svelte";
    import type { ChallengeData } from "$lib/database/db";
    import type { RegistryImages } from "$lib/server/registry";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import * as Select from '$lib/components/ui/select';
    import Eye from "@lucide/svelte/icons/eye";
    import EyeOff from "@lucide/svelte/icons/eye-off";

    let creationDisabled = $state<boolean>(false);
    let showFlag = $state<boolean>(false);
    let flagValue = $state<string>("");

    const { title, action_target, subaction_target, challenge, result, onSubmit, uploaded_files, registry_images, requireFlag } : {
        title: string,
        action_target: string,
        subaction_target: string | undefined,
        challenge: ChallengeData | undefined,
        onSubmit?: (data: { success: true; message: string } | { success: false; error: string } | undefined) => void,
        result: { error?: string, success?: boolean, message?: string } | null,
        uploaded_files: {
            archives: string[];
            bins: string[];
            jail_confs: string[];
        },
        registry_images: RegistryImages,
        requireFlag: boolean
    } = $props();

    const challenge_catagory: string[] = [
        "Web Exploitation",
        "Cryptography",
        "Reverse Engineering",
        "Privilege Escalation",
        "Forensics",
        "Steganography",
        "Binary Exploitation",
        "General"
    ];
    const challenge_difficulty: string[] = [
        "Simple",
        "Easy",
        "Medium",
        "Hard",
        "Extreme"
    ];

    // form fields are seeded once from the initial `challenge` prop (create vs.
    // edit), then locally editable - not meant to track the prop reactively
    let archiveFiles = $state<string[]>(untrack(() => challenge?.hlinks || []));
    let archiveSearch = $state("");
    let filteredArchives = $derived(
        uploaded_files.archives.filter(file =>
            file.toLowerCase().includes(archiveSearch.toLowerCase())
        )
    );

    let nsjail_conf = $state<string|undefined>(untrack(() => challenge?.nsjail_conf || undefined));
    let imageRef = $state<string>(untrack(() => challenge?.image_ref || ""));
    let webImageRef = $state<string>(untrack(() => challenge?.web_image_ref || ""));

    let showManualImageRef = $state<boolean>(untrack(() => registry_images.ssh.length === 0));
    let showManualWebImageRef = $state<boolean>(untrack(() => registry_images.web.length === 0));
    let imageRefOptions = $derived(
        challenge?.image_ref && !registry_images.ssh.includes(challenge.image_ref)
            ? [challenge.image_ref, ...registry_images.ssh]
            : registry_images.ssh
    );
    let webImageRefOptions = $derived(
        challenge?.web_image_ref && !registry_images.web.includes(challenge.web_image_ref)
            ? [challenge.web_image_ref, ...registry_images.web]
            : registry_images.web
    );

    let jailConfSearch = $state("");
    let filteredJailConfs = $derived(
        uploaded_files.jail_confs.filter(file =>
            file.toLowerCase().includes(jailConfSearch.toLowerCase())
        )
    );

    let hints = $state<string[]>(
        untrack(() => challenge?.hints?.length
            ? [...challenge.hints]
            : [""])
    );

    let category = $state<string>(untrack(() => challenge?.category || ""));
    let difficulty = $state<string>(untrack(() => challenge?.difficulty || ""));

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
                    } else if (result.type === 'failure') {
                        const data = result.data as { error?: string } | undefined;
                        onSubmit?.({
                            success: false,
                            error: data?.error ?? 'An error occurred'
                        });
                    } else if (result.type === 'error') {
                        onSubmit?.({ success: false, error: 'An error occurred' });
                    }
                };
            }}>
                <!-- Challenge Name -->
                <div class="mb-3 space-y-1.5">
                    <Label for="name" class="font-semibold">Challenge Name</Label>
                    <Input
                        type="text"
                        id="name"
                        class="inputText"
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
                        class="inputText"
                        name="written_by" required
                        value={challenge?.written_by || ""}
                        placeholder="Enter challenge author name"
                    />
                </div>

                <!-- Challenge Files -->
                <div class="mb-3">
                    <Label for="attached-files" class="font-semibold">Challenge Files</Label>
                    <hr class="my-2 border-border" />

                    {#each archiveFiles as file}
                        <input type="hidden" name="attached_files" value={file} />
                    {/each}

                    <details class="rounded-lg border border-border p-3">
                        <summary class="cursor-pointer text-xs font-medium text-muted-foreground select-none">
                            {archiveFiles.length > 0 ? `Show Archives (${archiveFiles.length} attached)` : "Show Archives"}
                        </summary>

                        <div class="mt-2 mb-2">
                            <Input
                                type="text"
                                class="h-7 text-xs inputText"
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
                                        value={file}
                                        bind:group={archiveFiles}
                                        class="m-0 accent-brand-green"
                                    />
                                    {file}
                                </label>
                            {/each}
                        </div>
                    </details>
                </div>

                <!-- nsjail configuration files -->
                <div class="mb-3">
                    <Label for="attached-files" class="font-semibold">nsjail Configurations</Label>
                    <hr class="my-2 border-border" />

                    {#if nsjail_conf}
                        <input type="hidden" name="nsjail_conf" value={nsjail_conf} />
                    {/if}

                    <details class="rounded-lg border border-border p-3">
                        <summary class="cursor-pointer text-xs font-medium text-muted-foreground select-none">
                            {nsjail_conf ? `Show nsjail Configs (${nsjail_conf} selected)` : "Show nsjail Configs"}
                        </summary>

                        <div class="mt-2 mb-2">
                            <Input
                                type="text"
                                class="h-7 text-xs inputText"
                                placeholder="Search files..."
                                bind:value={jailConfSearch}
                            />
                        </div>

                        <div class="flex flex-wrap gap-2 rounded-lg border border-border p-2">
                            {#if filteredJailConfs.length === 0}
                                <p class="mb-0 text-sm text-muted-foreground">
                                    {uploaded_files.jail_confs.length === 0 ? "No files uploaded" : "No files match your search"}
                                </p>
                            {/if}

                            {#each filteredJailConfs as file}
                                <label for={`file-${file}`} class={fileLabelClass}>
                                    <input
                                        type="radio"
                                        id={`file-${file}`}
                                        value={file}
                                        bind:group={nsjail_conf}
                                        class="m-0 accent-brand-green"
                                    />
                                    {file}
                                </label>
                            {/each}
                        </div>
                    </details>
                </div>

                <!-- SSH Instance Image -->
                <div class="mb-3 space-y-1.5">
                    <div class="flex items-center justify-between">
                        <Label for="image-ref" class="font-semibold">SSH Instance Image</Label>
                        {#if imageRefOptions.length > 0}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onclick={() => { showManualImageRef = !showManualImageRef }}
                            >
                                {showManualImageRef ? "Choose from registry" : "Enter manually"}
                            </Button>
                        {/if}
                    </div>

                    {#if showManualImageRef}
                        <Input
                            type="text"
                            id="image-ref"
                            name="image_ref"
                            class="inputText"
                            bind:value={imageRef}
                            placeholder="e.g. khi-ssh/go1:latest"
                        />
                    {:else}
                        <select id="image-ref" name="image_ref" class={selectClass} bind:value={imageRef}>
                            <option value="">None</option>
                            {#each imageRefOptions as img}
                                <option value={img}>{img}</option>
                            {/each}
                        </select>
                    {/if}
                </div>

                <!-- Web Instance Image -->
                <div class="mb-3 space-y-1.5">
                    <div class="flex items-center justify-between">
                        <Label for="web-image-ref" class="font-semibold">Web Instance Image</Label>
                        {#if webImageRefOptions.length > 0}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onclick={() => { showManualWebImageRef = !showManualWebImageRef }}
                            >
                                {showManualWebImageRef ? "Choose from registry" : "Enter manually"}
                            </Button>
                        {/if}
                    </div>

                    {#if showManualWebImageRef}
                        <Input
                            type="text"
                            id="web-image-ref"
                            name="web_image_ref"
                            class="inputText"
                            bind:value={webImageRef}
                            placeholder="e.g. khi-web/profilepeek:latest"
                        />
                    {:else}
                        <select id="web-image-ref" name="web_image_ref" class={selectClass} bind:value={webImageRef}>
                            <option value="">None</option>
                            {#each webImageRefOptions as img}
                                <option value={img}>{img}</option>
                            {/each}
                        </select>
                    {/if}
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
                                class="inputText"
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

                        <Select.Root type="single" bind:value={category} name="category" required={true}>
                            <Select.Trigger class="w-full">
                                {category || "Select category"}
                            </Select.Trigger>
                            <Select.Content>
                                {#each challenge_catagory as t}
                                    <Select.Item value={t}>{t}</Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <div class="mb-3 space-y-1.5">
                        <Label for="difficulty" class="font-semibold">Difficulty</Label>

                        <Select.Root type="single" bind:value={difficulty} name="difficulty" required={true}>
                            <Select.Trigger class="w-full">
                                {difficulty || "Select difficulty"}
                            </Select.Trigger>
                            <Select.Content>
                                {#each challenge_difficulty as diff}
                                    <Select.Item value={diff}>{diff}</Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
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
                            class="inputText"
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
                        class="inputText"
                        value={challenge.id}
                        hidden
                    />
                {/if}

                <!-- Submit -->
                {#if challenge === undefined && requireFlag}
                    <div class="flex justify-center gap-4">
                        <Button type="submit" formaction={subaction_target} class="flex-1">Submit as Gym</Button>
                        <Button type="submit" formaction={action_target} class="flex-1">Submit as Event</Button>
                    </div>
                {:else}
                    <Button
                        type="submit"
                        class="w-full"
                    >
                        Submit
                    </Button>
                {/if}
            </form>
        </Card.Content>
    </Card.Root>
</div>