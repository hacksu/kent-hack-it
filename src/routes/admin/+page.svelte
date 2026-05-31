<script lang="ts">
    import UsersTab from './d.users.svelte';
    import TeamsTab from './d.teams.svelte';
    import AdminsTab from './d.admins.svelte';
    import SolversTab from './d.solvers.svelte';
    import ChallengeView from './d.view.svelte';
    import ChallengeCreate from './d.create.svelte';
    import FileUploadTab from './d.upload.svelte';
    import ConfigTab from './d.config.svelte';
    import LogTab from './d.logs.svelte';

    import { page } from '$app/state';
    import { goto } from '$app/navigation';

    const { data } = $props();

    let activeTab = $derived(page.url.searchParams.get('tab') ?? 'users');
    function setTab(tab: string) {
        goto(`?tab=${tab}`, { replaceState: true, keepFocus: true, noScroll: true });
    }

    const tabs = [
        { title: "Users",      value: "users",    component: UsersTab,          props: () => ({ users: data.players }) },
        { title: "Teams",      value: "teams",    component: TeamsTab,          props: () => ({ teams: data.teams }) },
        { title: "Admins",     value: "admins",   component: AdminsTab,         props: () => ({ admins: data.admins }) },
        { title: "Solvers",    value: "solvers",  component: SolversTab,        props: () => ({ solvers: data.solvers, challenges: data.challenges }) },
        { title: "View",       value: "view",     component: ChallengeView,     props: () => ({ uploaded_files: data.files, challenges: data.challenges, form: undefined }) },
        { title: "Create",     value: "create",   component: ChallengeCreate,   props: () => ({ uploaded_files: data.files, form: undefined }) },
        { title: "Upload",     value: "upload",   component: FileUploadTab,     props: () => ({ uploaded_files: data.files }) },
        { title: "Configuration",     value: "config",   component: ConfigTab,  props: () => ({ config: data.config }) },
        { title: "Logs",     value: "logs",   component: LogTab,                props: () => ({ entries: data.log_data }) },
    ];

    let activeComponent = $derived(tabs.find(t => t.value === activeTab));
</script>

<main>
    <header style="display: block; height: auto; padding-top: 0;">
        <h1 style="padding: 15px;">Admin Panel</h1>

        <div class="container">
            <ul class="nav nav-tabs">
                {#each tabs as t}
                    <li class="nav-item">
                        <button
                            class="nav-link {activeTab === t.value ? 'active' : ''}"
                            style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                            onclick={() => setTab(t.value)}
                        >
                            {t.title}
                        </button>
                    </li>
                {/each}
            </ul>

            <div class="tab-content mt-4">
                {#if activeComponent}
                    <svelte:component this={activeComponent.component} {...activeComponent.props()} />
                {/if}
            </div>
        </div>
    </header>
</main>