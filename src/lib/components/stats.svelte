<script lang="ts">
    import { slide } from 'svelte/transition';
    import PieChart from './pie_chart.svelte';
    
    const { progressData, showAll } = $props();
    
    let showTotal = $state(false);
    let showEvent = $state(false);
    let showTeam  = $state(false);
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/stats.css">
</svelte:head>

<div class="stat-area">

    <!-- Total Progress -->
    <button style="margin: 5px;" class="stat-toggle" onclick={() => showTotal = !showTotal}>
        <span>Total Progress</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="chevron" style:transform="rotate({showTotal ? 180 : 0}deg)" aria-hidden="true">
            <polyline points="4 6 8 10 12 6"/>
        </svg>
    </button>
    {#if showTotal}
        <div class="stat-panel" transition:slide={{ duration: 350 }}>
            {#each progressData.totalProg as stat}
                <div class="stat-row">
                    <div class="stat-header">
                        <span class="stat-label">{stat.label}</span>
                        <span class="stat-count">{stat.value} / {stat.total}</span>
                    </div>
                    <div class="stat-track">
                        <div
                            class="stat-fill"
                            style:width="{(stat.value / stat.total) * 100}%"
                            style:background={stat.color ?? 'var(--accent, #6366f1)'}
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Event Progress -->
    <button style="margin: 5px;" class="stat-toggle" onclick={() => showEvent = !showEvent}>
        <span>Event Progress</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="chevron" style:transform="rotate({showEvent ? 180 : 0}deg)" aria-hidden="true">
            <polyline points="4 6 8 10 12 6"/>
        </svg>
    </button>
    {#if showEvent}
        <div class="stat-panel" transition:slide={{ duration: 350 }}>
            {#each progressData.eventProg as stat}
                <div class="stat-row">
                    <div class="stat-header">
                        <span class="stat-label">{stat.label}</span>
                        <span class="stat-count">{stat.value} / {stat.total}</span>
                    </div>
                    <div class="stat-track">
                        <div
                            class="stat-fill"
                            style:width="{(stat.value / stat.total) * 100}%"
                            style:background={stat.color ?? '#72b35f'}
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Team Progress -->
    {#if showAll && progressData.teamProg}
        <button style="margin: 5px;" class="stat-toggle" onclick={() => showTeam = !showTeam}>
            <span>Team Progress</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="chevron" style:transform="rotate({showTeam ? 180 : 0}deg)" aria-hidden="true">
                <polyline points="4 6 8 10 12 6"/>
            </svg>
        </button>
        {#if showTeam}
            <div class="stat-panel" transition:slide={{ duration: 350 }}>
                {#each progressData.teamProg.bars as stat}
                    <div class="stat-row">
                        <div class="stat-header">
                            <span class="stat-label">{stat.label}</span>
                            <span class="stat-count">{stat.value} / {stat.total}</span>
                        </div>
                        <div class="stat-track">
                            <div
                                class="stat-fill"
                                style:width="{(stat.value / stat.total) * 100}%"
                                style:background={stat.color ?? '#f59e0b'}
                            ></div>
                        </div>
                    </div>
                {/each}

                <div class="stat-row">
                    <div class="stat-header">
                        <span class="stat-label">Contributions</span>
                    </div>
                    
                    <PieChart progressData={progressData} showTeam={showTeam} />
                </div>
            </div>
        {/if}
    {/if}

</div>