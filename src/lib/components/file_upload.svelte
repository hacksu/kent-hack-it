<script lang="ts">
    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities";
    import { enhance } from "$app/forms";
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";
    import LoaderCircle from "@lucide/svelte/icons/loader-circle";
    import Trash2 from "@lucide/svelte/icons/trash-2";
    import { MAX_UPLOAD_FILE_SIZE, MAX_UPLOAD_SIZE_MB } from "$lib/upload-limits";

    let {
        summaryText,
        cardTitle,
        formAction,
        fieldName,
        accepted_files = "",
        uploadsDisabled = false,
        uploaded_files
    }: {
        summaryText: string;
        cardTitle: string;
        formAction: string;
        fieldName: string;
        accepted_files?: string;
        uploadsDisabled?: boolean;
        uploaded_files: string[];
    } = $props();

    const f_type = $derived((() => {
        if (accepted_files === ".zip") return "archive";
        if (accepted_files === ".json") return "nsjail";
        return "bin";
    })());

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
        const input = e.target as HTMLInputElement;
        const picked = Array.from(input.files ?? []);


        if (accepted_files.length > 0) {
            // check for multiple accepted files
            const valid_files = accepted_files.split(",").map(ext => ext.trim().toLowerCase());

            const invalid = picked.filter(file => {
                const name = file.name.toLowerCase();
                return !valid_files.some(ext => name.endsWith(ext));
            });

            if (invalid.length > 0) {
                error = `Only ${valid_files.join(", ")} files are allowed: ${invalid.map(f => f.name).join(", ")}`;
                input.value = "";
                selectedFiles = [];
                return;
            }
        }

        const tooBig = picked.filter(f => f.size > MAX_UPLOAD_FILE_SIZE);
        if (tooBig.length > 0) {
            error = `Files exceed ${MAX_UPLOAD_SIZE_MB} MB limit: ${tooBig.map(f => f.name).join(", ")}`;
            if (fileInput) fileInput.value = "";
            selectedFiles = [];
            return;
        }

        error = "";
        selectedFiles = picked;
    }

    async function handleDelete(filename: string) {
        if (window.confirm(`Are you sure you want to DELETE this file "${filename}"?`)) {
            const req = await fetch('/admin/api', {
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

<details class="group">
    <summary class="flex cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5 font-mono text-sm font-medium text-foreground select-none [&::-webkit-details-marker]:hidden">
        <span>{summaryText}</span>
        <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
    </summary>

    <div class="mt-4 flex justify-center">
        <div class={`w-full max-w-md ${uploadsDisabled ? 'opacity-50' : ''}`}>
            <Card.Root class="border border-border bg-card">
                <Card.Content>
                    <h3 class="mb-4 text-center font-mono text-lg font-bold text-foreground">{cardTitle}</h3>

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
                            <Input
                                name={fieldName}
                                type="file"
                                accept={accepted_files}
                                multiple
                                oninput={handleFileInput}
                                disabled={uploadsDisabled || uploading}
                                bind:ref={fileInput}
                                class="cursor-pointer"
                            />

                            {#if selectedFiles.length > 0}
                                <small class="mt-2 block text-xs text-muted-foreground">
                                    Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}:
                                    {selectedFiles.map(f => f.name).join(', ')}
                                </small>
                            {/if}
                        </div>

                        <Button
                            type="submit"
                            class="w-full gap-2"
                            disabled={uploadsDisabled || selectedFiles.length === 0 || uploading}
                        >
                            {#if uploading}
                                <LoaderCircle class="h-4 w-4 animate-spin" />
                            {/if}
                            {uploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}` : ''}`}
                        </Button>
                    </form>
                </Card.Content>
            </Card.Root>
        </div>
    </div>

    <div class="mt-6">
        <h3 class="mb-3 text-center font-mono text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Current Uploads
        </h3>
        <div class="flex justify-center">
            <ul class="flex w-auto min-w-[300px] max-w-[600px] flex-col gap-2">
                {#each uploaded_files as file}
                    <li
                        class="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                        <a
                            href={`/api/download/${file}?t=${f_type}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="min-w-0 flex-1 truncate text-muted-foreground no-underline! transition-colors hover:text-brand-blue!"
                        >
                            {file}
                        </a>

                        <Button
                            variant="destructive"
                            size="sm"
                            class="shrink-0 gap-1.5"
                            onclick={() => handleDelete(file)}
                        >
                            <Trash2 class="h-3.5 w-3.5" /> Delete
                        </Button>
                    </li>
                {/each}
            </ul>
        </div>
        <div class="pb-16"></div>
    </div>
</details>
