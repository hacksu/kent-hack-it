<script lang="ts">
    import UploadSection from '$lib/components/file_upload.svelte';
    import AdminTabHeader from '$lib/components/admin-tab-header.svelte';
    import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

    let uploadsDisabled = $state(false);

    const {
        uploaded_files
    } : {
        uploaded_files: {
            archives: string[];
            bins: string[];
            jail_confs: string[];
        }
    } = $props();
</script>

<AdminTabHeader title="File uploads" count={uploaded_files.archives.length + uploaded_files.bins.length + uploaded_files.jail_confs.length} />

<div class="space-y-4">
    {#if uploadsDisabled}
        <div class="mb-4 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning" role="alert">
            <TriangleAlert class="h-4 w-4 shrink-0" />
            <strong>Uploads disabled:</strong> File uploads are currently disabled during the event.
        </div>
    {/if}

    <UploadSection
        summaryText="Challenge archives (.zip)"
        cardTitle="Upload challenge archive"
        formAction="?/upload_files"
        fieldName="challenge_archives"
        accepted_files={".zip"}
        {uploadsDisabled}
        uploaded_files={uploaded_files.archives}
    />

    <UploadSection
        summaryText="Executable files"
        cardTitle="Upload executable"
        formAction="?/upload_exec_files"
        fieldName="bins"
        {uploadsDisabled}
        uploaded_files={uploaded_files.bins}
    />

    <UploadSection
        summaryText="nsjail configurations (.json)"
        cardTitle="Upload nsjail configuration"
        formAction="?/upload_jail_conf"
        fieldName="jail_confs"
        accepted_files={".json"}
        {uploadsDisabled}
        uploaded_files={uploaded_files.jail_confs}
    />
</div>