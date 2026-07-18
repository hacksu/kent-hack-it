<script lang="ts">
    import UploadSection from '$lib/components/file_upload.svelte';

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

<div class="container">
    {#if uploadsDisabled}
        <div class="alert alert-warning text-center mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
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