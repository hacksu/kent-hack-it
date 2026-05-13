<script lang="ts">
    const { success, warning, error } : {
            success:string,
            warning:string,
            error:string
        } = $props();
</script>

{#if error}
    <div class="alert alert-danger">{error}</div>
{/if}
{#if success}
    <div class="alert alert-success">{success}</div>
{/if}
{#if warning}
    <div class="alert alert-warning">{warning}</div>
{/if}