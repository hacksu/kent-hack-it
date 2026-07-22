<script lang="ts">
    import UploadSection from '$lib/components/file_upload.svelte';
    import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

    let uploadsDisabled = $state(false);

    const {
        uploaded_files
    } : {
        uploaded_files: {
            archives: string[];
            bins: string[];
        }
    } = $props();
</script>

<div>
    {#if uploadsDisabled}
        <div class="mb-4 flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-sm text-amber-500" role="alert">
            <TriangleAlert class="h-4 w-4 shrink-0" />
            <strong>Uploads Disabled:</strong> File uploads are currently disabled during the event.
        </div>
    {/if}

    <UploadSection
        summaryText="Upload Compressed CTF Challenge Files (zip)"
        cardTitle="Upload Challenge"
        formAction="?/upload_files"
        fieldName="challenge_archives"
        {uploadsDisabled}
        uploaded_files={uploaded_files.archives}
    />

    <UploadSection
        summaryText="Upload Compressed CTF Executable Files"
        cardTitle="Upload CTF Binary"
        formAction="?/upload_exec_files"
        fieldName="bins"
        zip_only={false}
        {uploadsDisabled}
        uploaded_files={uploaded_files.bins}
    />
</div>