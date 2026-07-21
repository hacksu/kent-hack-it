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
    import InstancesTab from './d.instances.svelte';

    import { page } from '$app/state';
    import { goto } from '$app/navigation';

    import * as Tabs from '$lib/components/ui/tabs';

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
        { title: "Instances",     value: "instances",   component: InstancesTab, props: () => ({ nc_instances: data.nc_instances }) },
    ];

    let activeComponent = $derived(tabs.find(t => t.value === activeTab));
</script>

<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10">
    <div class="mb-6 flex items-center gap-2.5">
        <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
        <h1 class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Admin Panel</h1>
    </div>

    <Tabs.Root value={activeTab} onValueChange={setTab}>
        <Tabs.List
            variant="line"
            class="mb-6 h-auto flex-wrap justify-start gap-1 border-b border-border pb-0"
        >
            {#each tabs as t (t.value)}
                <Tabs.Trigger
                    value={t.value}
                    class="rounded-lg px-3 py-1.5 text-sm font-medium data-active:bg-gradient-to-r data-active:from-brand-green/15 data-active:to-brand-blue/10 data-active:text-foreground! data-active:after:opacity-0"
                >
                    {t.title}
                </Tabs.Trigger>
            {/each}
        </Tabs.List>
    </Tabs.Root>

    <div class="rounded-2xl border border-border bg-card p-4 sm:p-6">
        {#if activeComponent}
            {@const Comp = activeComponent.component}
            <Comp {...activeComponent.props()} />
        {/if}
    </div>
</main>