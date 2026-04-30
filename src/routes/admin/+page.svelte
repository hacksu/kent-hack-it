<script lang="ts">
    import UsersTab from './d.users.svelte';
    import TeamsTab from './d.teams.svelte';
    import AdminsTab from './d.admins.svelte';
    import SolversTab from './d.solvers.svelte';
    import ChallengeView from './d.view.svelte';
    import ChallengeCreate from './d.create.svelte';
    import FileUploadTab from './d.upload.svelte';

    // control over refresh to persist the focused tab
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    let activeTab = $derived(page.url.searchParams.get('tab') ?? 'users');
    function setTab(tab: string) {
        goto(`?tab=${tab}`, { replaceState: true, keepFocus: true, noScroll: true });
    }

    const { data } = $props();
</script>

<main>
    <header style=" display: block; height: auto; padding-top: 0;">
        <h1 style="padding: 15px;">Admin Panel</h1>

        <!-- manual site kill switch -->

        <div class="container">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'users' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("users")}
                    >
                        Users
                    </button>
                </li>

                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'teams' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("teams")}
                    >
                        Teams
                    </button>
                </li>

                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'admins' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("admins")}
                    >
                        Admins
                    </button>
                </li>

                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'solvers' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("solvers")}
                    >
                        Solvers
                    </button>
                </li>

                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'view' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("view")}
                    >
                        View Challenges
                    </button>
                </li>

                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'create' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("create")}
                    >
                        Create Challenge
                    </button>
                </li>

                <li class="nav-item">
                    <button
                        class="nav-link {activeTab === 'upload' ? 'active' : ''}"
                        style="font-size: 1.5rem; padding: 0.25rem 0.5rem"
                        onclick={() => setTab("upload")}
                    >
                        Upload
                    </button>
                </li>
            </ul>

            <div class="tab-content mt-4">
            {#if activeTab === "users"}
                <UsersTab />
            {:else if activeTab === "teams"}
                <TeamsTab />
            {:else if activeTab === "admins"}
                <AdminsTab admins={ data.admins } />
            {:else if activeTab === "solvers"}
                <SolversTab />
            {:else if activeTab === "view"}
                <ChallengeView challenges={ data.challenges } />
            {:else if activeTab === "create"}
                <ChallengeCreate />
            {:else if activeTab === "upload"}
                <FileUploadTab />
            {/if}
            </div>
        </div>
    </header>
</main>