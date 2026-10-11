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
    import { tick } from 'svelte';
    import { goto } from '$app/navigation';

    import PageHeader from '$lib/components/page-header.svelte';

    import * as Tabs from '$lib/components/ui/tabs';

    const { data } = $props();

    let activeTab = $derived(page.url.searchParams.get('tab') ?? 'users');
    function setTab(tab: string) {
        goto(`?tab=${tab}`, { replaceState: true, keepFocus: true, noScroll: true });
    }

    const tabs = [
        { title: "Users",      value: "users", group: "People",    component: UsersTab,          props: () => ({ users: data.players }) },
        { title: "Teams",      value: "teams", group: "People",    component: TeamsTab,          props: () => ({ teams: data.teams }) },
        { title: "Admins",     value: "admins", group: "People",   component: AdminsTab,         props: () => ({ admins: data.admins }) },
        { title: "Solvers",    value: "solvers", group: "People",  component: SolversTab,        props: () => ({ solvers: data.solvers, challenges: data.challenges }) },
        { title: "View",       value: "view", group: "Challenges",     component: ChallengeView,     props: () => ({ uploaded_files: data.files, challenges: data.challenges, registry_images: data.registry_images, form: undefined }) },
        { title: "Create",     value: "create", group: "Challenges",   component: ChallengeCreate,   props: () => ({ uploaded_files: data.files, registry_images: data.registry_images, form: undefined }) },
        { title: "Upload",     value: "upload", group: "Challenges",   component: FileUploadTab,     props: () => ({ uploaded_files: data.files }) },
        { title: "Configuration",     value: "config", group: "System",   component: ConfigTab,  props: () => ({ config: data.config }) },
        { title: "Logs",     value: "logs", group: "System",   component: LogTab,                props: () => ({ entries: data.log_data }) },
        { title: "Instances",     value: "instances", group: "System",   component: InstancesTab, props: () => ({ instances: data.instances, challenges: data.challenges }) },
    ];

    let tabStrip = $state<HTMLDivElement | null>(null);
    $effect(() => {
        activeTab;
        const strip = tabStrip;
        if (!strip) return;
        void tick().then(() => {
            const selected = strip.querySelector('[role="tab"][data-state="active"]');
            if (!selected) return;
            const stripBounds = strip.getBoundingClientRect();
            const tabBounds = selected.getBoundingClientRect();
            if (tabBounds.left < stripBounds.left) strip.scrollLeft -= stripBounds.left - tabBounds.left + 12;
            else if (tabBounds.right > stripBounds.right) strip.scrollLeft += tabBounds.right - stripBounds.right + 12;
        });
    });

    let activeComponent = $derived(tabs.find(t => t.value === activeTab));
</script>

<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader title="Admin panel" />

    <Tabs.Root value={activeTab} onValueChange={setTab}>
        <div bind:this={tabStrip} class="mb-6 overflow-x-auto border-b border-border" aria-label="Admin navigation">
            <Tabs.List variant="line" aria-label="Admin sections" class="h-auto justify-start gap-0 px-0 pt-0 pb-3">
                {#each ['People', 'Challenges', 'System'] as group}
                    <div class="flex shrink-0 items-center gap-2 border-r border-border pr-4 pl-4 first:pl-0 last:border-r-0 last:pr-0" role="presentation">
                        <p class="eyebrow pr-1 text-[0.625rem]">{group}</p>
                        <div class="flex gap-1">
                            {#each tabs.filter(t => t.group === group) as t (t.value)}
                                <Tabs.Trigger
                                    value={t.value}
                                    class="h-8 flex-none rounded-md px-2.5 text-sm data-active:font-semibold data-active:text-brand-green dark:data-active:text-brand-green group-data-[variant=line]/tabs-list:data-active:bg-brand-green/12 dark:group-data-[variant=line]/tabs-list:data-active:bg-brand-green/12 group-data-[variant=line]/tabs-list:data-active:after:opacity-0"
                                >
                                    {t.title}
                                </Tabs.Trigger>
                            {/each}
                        </div>
                    </div>
                {/each}
            </Tabs.List>
        </div>
    </Tabs.Root>

    {#if activeComponent}
        {@const Comp = activeComponent.component}
        <Comp {...(activeComponent.props() as any)} />
    {/if}
</main>
