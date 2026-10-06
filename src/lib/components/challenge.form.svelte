<script lang="ts">
    import { enhance } from "$app/forms";
    import { untrack } from "svelte";
    import type { ChallengeData } from "$lib/database/db";
    import type { RegistryImages } from "$lib/server/registry";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Button } from "$lib/components/ui/button";
    import * as Select from '$lib/components/ui/select';
    import { difficultyTone } from "$lib/difficulty";
    import Eye from "@lucide/svelte/icons/eye";
    import EyeOff from "@lucide/svelte/icons/eye-off";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import Plus from "@lucide/svelte/icons/plus";
    import X from "@lucide/svelte/icons/x";

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
    let archiveFiles = $state<string[]>(untrack(() => challenge?.hlinks ?? []));
    let archiveSearch = $state("");
    let filteredArchives = $derived(
        uploaded_files.archives.filter(file =>
            file.toLowerCase().includes(archiveSearch.toLowerCase())
        )
    );

    let nsjail_conf = $state<string|undefined>(untrack(() => challenge?.nsjail_conf ?? undefined));
    let imageRef = $state<string>(untrack(() => challenge?.image_ref ?? ""));
    let webImageRef = $state<string>(untrack(() => challenge?.web_image_ref ?? ""));

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

    let category = $state<string>(untrack(() => challenge?.category ?? ""));
    let difficulty = $state<string>(untrack(() => challenge?.difficulty ?? ""));

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
        "bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 py-1 text-base outline-none transition-colors md:text-sm";
    const fileLabelClass =
        "flex max-w-full cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground transition-colors select-none hover:bg-accent has-checked:border-brand-green/40 has-checked:bg-brand-green/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/40";
    const helpClass = "text-xs text-muted-foreground";
    const sectionClass = "space-y-4 border-t border-border px-5 py-5 first:border-t-0";
</script>

{#snippet sectionHead(heading: string, help?: string)}
    <div class="space-y-1">
        <h3 class="eyebrow">{heading}</h3>
        {#if help}
            <p class={helpClass}>{help}</p>
        {/if}
    </div>
{/snippet}

<!-- use:enhance allows us to track the result from the form POST -->
<form class="@container flex min-w-0 flex-col" method="POST" action={action_target} use:enhance={() => {
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
    <header class="px-5 pt-5 pr-14 pb-4">
        <h2 class="text-base font-semibold tracking-tight text-foreground">{title}</h2>
    </header>

    <!-- Basics -->
    <section class={sectionClass}>
        {@render sectionHead("Basics")}

        <div class="space-y-1.5">
            <Label for="name">Name</Label>
            <Input
                type="text"
                id="name"
                name="name" required
                value={challenge?.name ?? ""}
                placeholder="Enter challenge name"
            />
        </div>

        <div class="space-y-1.5">
            <Label for="desc">Description</Label>
            <Textarea
                id="desc"
                name="description" required
                value={challenge?.description ?? ""}
                class="min-h-28 resize-y"
                placeholder="Enter a short challenge description"
            ></Textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 @lg:grid-cols-2">
            <div class="space-y-1.5">
                <Label for="category">Category</Label>
                <Select.Root type="single" bind:value={category} name="category" required={true}>
                    <Select.Trigger id="category" class="w-full">
                        {category || "Select category"}
                    </Select.Trigger>
                    <Select.Content>
                        {#each challenge_catagory as t}
                            <Select.Item value={t}>{t}</Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
            </div>

            <div class="space-y-1.5">
                <Label for="difficulty">Difficulty</Label>
                <Select.Root type="single" bind:value={difficulty} name="difficulty" required={true}>
                    <Select.Trigger id="difficulty" class="w-full">
                        <span class="flex items-center gap-2">
                            {#if difficulty}
                                <span class="size-1.5 rounded-full {difficultyTone(difficulty).dot}"></span>
                            {/if}
                            {difficulty || "Select difficulty"}
                        </span>
                    </Select.Trigger>
                    <Select.Content>
                        {#each challenge_difficulty as diff}
                            <Select.Item value={diff}>
                                <span class="size-1.5 self-center rounded-full {difficultyTone(diff).dot}"></span>
                                {diff}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>
                <p class={helpClass}>Points are set by difficulty.</p>
            </div>

            <div class="space-y-1.5 @lg:col-span-2">
                <Label for="author">Written by</Label>
                <Input
                    type="text"
                    id="author"
                    name="written_by" required
                    value={challenge?.written_by ?? ""}
                    placeholder="Enter challenge author name"
                />
            </div>
        </div>
    </section>

    <!-- Flag -->
    <section class={sectionClass}>
        {@render sectionHead("Flag")}

        <div class="space-y-1.5">
            <Label for="flag-value">Flag value</Label>
            <div class="flex gap-2">
                <Input
                    id="flag-value"
                    type={ showFlag ? "text" : "password" }
                    name="flag"
                    class="font-mono"
                    required={requireFlag}
                    placeholder={requireFlag ? "Enter flag" : "Unchanged"}
                    autocomplete="off"
                    bind:value={flagValue}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={showFlag ? "Hide flag" : "Show flag"}
                    aria-pressed={showFlag}
                    onclick={() => { showFlag = !showFlag }}
                >
                    {#if showFlag}
                        <EyeOff />
                    {:else}
                        <Eye />
                    {/if}
                </Button>
            </div>
            <p class={helpClass}>
                {requireFlag ? "Required. The flag is not shown again once saved." : "Leave blank to keep the current flag."}
            </p>
        </div>
    </section>

    <!-- Files and hints -->
    <section class={sectionClass}>
        {@render sectionHead("Files and hints")}

        <div class="space-y-1.5">
            <p class="text-sm leading-none font-medium" id="archives-label">Challenge files</p>

            {#each archiveFiles as file}
                <input type="hidden" name="attached_files" value={file} />
            {/each}

            <details class="group rounded-lg border border-border bg-background/50" aria-labelledby="archives-label">
                <summary class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground select-none hover:text-foreground">
                    <ChevronRight class="size-4 shrink-0 transition-transform group-open:rotate-90" />
                    <span class="min-w-0 flex-1 truncate">Choose from uploaded archives</span>
                    <span class="font-mono text-xs tabular-nums {archiveFiles.length > 0 ? 'text-brand-green' : ''}">
                        {archiveFiles.length} attached
                    </span>
                </summary>

                <div class="space-y-2 border-t border-border p-3">
                    <Input
                        type="search"
                        class="h-7 text-xs"
                        placeholder="Search files…"
                        aria-label="Search archives"
                        bind:value={archiveSearch}
                    />

                    <div class="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {#if filteredArchives.length === 0}
                            <p class="text-sm text-muted-foreground">
                                {uploaded_files.archives.length === 0 ? "No files uploaded" : "No files match your search"}
                            </p>
                        {/if}

                        {#each filteredArchives as file}
                            <label for={`archive-${file}`} class={fileLabelClass}>
                                <input
                                    type="checkbox"
                                    id={`archive-${file}`}
                                    value={file}
                                    bind:group={archiveFiles}
                                    class="m-0 accent-brand-green"
                                />
                                <span class="truncate">{file}</span>
                            </label>
                        {/each}
                    </div>
                </div>
            </details>
        </div>

        <div class="space-y-1.5">
            <p class="text-sm leading-none font-medium" id="hints-label">Hints</p>

            <div class="space-y-2" role="group" aria-labelledby="hints-label">
                {#each hints as _, index}
                    <div class="flex items-center gap-2">
                        <span class="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                        <Input
                            type="text"
                            bind:value={hints[index]}
                            aria-label={`Hint ${index + 1}`}
                            placeholder={`Hint #${index + 1}`}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove hint ${index + 1}`}
                            onclick={() => removeHint(index)}
                        >
                            <X />
                        </Button>
                    </div>
                {/each}
            </div>

            <div class="flex items-center justify-between gap-3 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onclick={addHint}
                >
                    <Plus />
                    Add hint
                </Button>
                <p class={helpClass}>Blank hints are ignored.</p>
            </div>

            <!-- Hidden field sent to backend -->
            <input
                type="hidden"
                name="hints"
                value={JSON.stringify(
                    hints.filter(h => h.trim() !== "")
                )}
            />
        </div>
    </section>

    <!-- Instance configuration -->
    <section class={sectionClass}>
        {@render sectionHead("Instance configuration", "Optional. Only needed when players connect to a live instance of this challenge.")}

        <div class="grid grid-cols-1 gap-4 @lg:grid-cols-2">
            <div class="min-w-0 space-y-1.5">
                <div class="flex min-h-6 items-center justify-between gap-2">
                    <Label for="image-ref">SSH instance image</Label>
                    {#if imageRefOptions.length > 0}
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
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
                        class="font-mono"
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

            <div class="min-w-0 space-y-1.5">
                <div class="flex min-h-6 items-center justify-between gap-2">
                    <Label for="web-image-ref">Web instance image</Label>
                    {#if webImageRefOptions.length > 0}
                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
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
                        class="font-mono"
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
        </div>

        <div class="space-y-1.5">
            <p class="text-sm leading-none font-medium" id="nsjail-label">nsjail configuration</p>

            {#if nsjail_conf}
                <input type="hidden" name="nsjail_conf" value={nsjail_conf} />
            {/if}

            <details class="group rounded-lg border border-border bg-background/50" aria-labelledby="nsjail-label">
                <summary class="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground select-none hover:text-foreground">
                    <ChevronRight class="size-4 shrink-0 transition-transform group-open:rotate-90" />
                    <span class="min-w-0 flex-1 truncate">Choose from uploaded configs</span>
                    <span class="max-w-[50%] truncate font-mono text-xs {nsjail_conf ? 'text-brand-green' : ''}">
                        {nsjail_conf ?? "none selected"}
                    </span>
                </summary>

                <div class="space-y-2 border-t border-border p-3">
                    <Input
                        type="search"
                        class="h-7 text-xs"
                        placeholder="Search files…"
                        aria-label="Search nsjail configs"
                        bind:value={jailConfSearch}
                    />

                    <div class="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {#if filteredJailConfs.length === 0}
                            <p class="text-sm text-muted-foreground">
                                {uploaded_files.jail_confs.length === 0 ? "No files uploaded" : "No files match your search"}
                            </p>
                        {/if}

                        {#each filteredJailConfs as file}
                            <label for={`jail-${file}`} class={fileLabelClass}>
                                <input
                                    type="radio"
                                    id={`jail-${file}`}
                                    value={file}
                                    bind:group={nsjail_conf}
                                    class="m-0 accent-brand-green"
                                />
                                <span class="truncate">{file}</span>
                            </label>
                        {/each}
                    </div>
                </div>
            </details>
        </div>
    </section>

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
    <footer class="sticky bottom-0 z-10 flex items-center gap-2 border-t border-border bg-card px-5 py-3 @lg:justify-end">
        {#if challenge === undefined && requireFlag}
            <Button type="submit" variant="outline" class="flex-1 @lg:flex-none" formaction={subaction_target}>Create as gym</Button>
            <Button type="submit" class="flex-1 @lg:flex-none" formaction={action_target}>Create as event</Button>
        {:else}
            <Button type="submit" class="flex-1 @lg:flex-none">Save changes</Button>
        {/if}
    </footer>
</form>
