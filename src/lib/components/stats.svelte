<script lang="ts">
    import { type Stat } from "$lib/mtypes";

    import { slide } from 'svelte/transition';
    let show = $state(false);

    const { progressBars } = $props();
    let stats = $state<Stat[]>(progressBars);
</script>

<svelte:head>
    <link rel="stylesheet" href="/css/stats.css">
</svelte:head>

<div class="stat-area">
    <button class="stat-toggle" onclick={() => show = !show}>
        <span>Progress</span>
        <svg
            width="14" height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="chevron"
            style:transform="rotate({show ? 180 : 0}deg)"
            aria-hidden="true"
        >
            <polyline points="4 6 8 10 12 6"/>
        </svg>
    </button>
    
    {#if show}
        <div class="stat-panel" transition:slide={{ duration: 350 }}>
            {#each stats as stat}
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
</div>