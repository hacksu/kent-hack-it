<script lang="ts">
    import Feedback from '$lib/components/feedback.svelte';
    import { handleFormResult } from "$lib/utilities";
    import { enhance } from "$app/forms";
    import Panel from "$lib/components/panel.svelte";
    import { Label } from "$lib/components/ui/label";
    import FileIcon from "@lucide/svelte/icons/file";
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


<details class="group overflow-hidden rounded-xl border border-border bg-card">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold select-none outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span class="min-w-0 flex-1">{summaryText}</span>
        <span class="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground tabular-nums" aria-label="Uploaded files">{uploaded_files.length}</span>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
    </summary>

    <div class="space-y-4 border-t border-border p-4 {uploadsDisabled ? 'opacity-50' : ''}">
        <Feedback success={success} warning={warning} error={error} />

        <form
            method="POST"
            enctype="multipart/form-data"
            action={formAction}
            class="space-y-3"
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
            <div class="space-y-1.5">
                <Label for={`upload-${fieldName}`}>{cardTitle}</Label>
                <Input
                    id={`upload-${fieldName}`}
                    name={fieldName}
                    type="file"
                    accept={accepted_files}
                    multiple
                    oninput={handleFileInput}
                    disabled={uploadsDisabled || uploading}
                    bind:ref={fileInput}
                    class="min-w-0 cursor-pointer"
                />
                <p class="text-xs text-muted-foreground">Up to <span class="font-mono tabular-nums">{MAX_UPLOAD_SIZE_MB}</span> MB per file{accepted_files ? ` · ${accepted_files}` : ''}.</p>
                {#if selectedFiles.length > 0}
                    <p class="text-xs break-words text-muted-foreground">
                        Selected <span class="font-mono tabular-nums">{selectedFiles.length}</span> file{selectedFiles.length !== 1 ? 's' : ''}: {selectedFiles.map(f => f.name).join(', ')}
                    </p>
                {/if}
            </div>

            <Button type="submit" disabled={uploadsDisabled || selectedFiles.length === 0 || uploading}>
                {#if uploading}<LoaderCircle class="animate-spin" />{/if}
                {uploading ? "Uploading…" : `Upload${selectedFiles.length > 0 ? ` ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}` : ' files'}`}
            </Button>
        </form>

        <Panel title="Current uploads">
            <ul class="divide-y divide-border">
                {#each uploaded_files as file}
                    <li class="flex items-center gap-2 px-3 py-2 text-sm">
                        <FileIcon class="size-4 shrink-0 text-muted-foreground" />
                        <a href={`/api/download/${file}?t=${f_type}`} target="_blank" rel="noopener noreferrer" class="link min-w-0 flex-1 truncate" title={file}>{file}</a>
                        <Button variant="ghost" size="icon-sm" class="shrink-0 text-muted-foreground hover:bg-destructive/15 hover:text-destructive" aria-label="Delete file {file}" title="Delete file {file}" onclick={() => handleDelete(file)}>
                            <Trash2 />
                        </Button>
                    </li>
                {:else}
                    <li class="px-3 py-6 text-center text-sm text-muted-foreground">No files uploaded yet.</li>
                {/each}
            </ul>
        </Panel>
    </div>
</details>
