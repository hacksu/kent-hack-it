<script lang="ts">
    import { slide } from 'svelte/transition';
    import PieChart from './pie_chart.svelte';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';

    const { progressData, showAll } = $props();

    let showTotal = $state(false);
    let showEvent = $state(false);
    let showTeam  = $state(false);

    const toggleClass =
        "m-[5px] flex w-[calc(100%-10px)] items-center justify-between rounded-lg border border-border bg-card px-3.5 py-2.5 font-mono text-sm font-medium text-foreground transition-colors select-none hover:border-brand-green/40 hover:bg-accent";
    const panelClass = "mt-1.5 w-full rounded-xl border border-border bg-card";
</script>

<div class="w-[90%]">

    <!-- Total Progress -->
    <button class={toggleClass} onclick={() => showTotal = !showTotal}>
        <span>Total Progress</span>
        <ChevronDown
            class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300"
            style="transform: rotate({showTotal ? 180 : 0}deg)"
        />
    </button>
    {#if showTotal}
        <div class={panelClass} transition:slide={{ duration: 350 }}>
            {#each progressData.totalProg as stat}
                <div class="m-[15px] flex flex-col gap-[7px]">
                    <div class="flex items-baseline justify-between">
                        <span class="text-[13px] font-medium text-foreground">{stat.label}</span>
                        <span class="text-xs text-muted-foreground">{stat.value} / {stat.total}</span>
                    </div>
                    <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            class="h-full rounded-full transition-[width] duration-400 ease-out"
                            style:width="{(stat.value / stat.total) * 100}%"
                            style:background={stat.color ?? 'var(--chart-2)'}
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Event Progress -->
    <button class={toggleClass} onclick={() => showEvent = !showEvent}>
        <span>Event Progress</span>
        <ChevronDown
            class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300"
            style="transform: rotate({showEvent ? 180 : 0}deg)"
        />
    </button>
    {#if showEvent}
        <div class={panelClass} transition:slide={{ duration: 350 }}>
            {#each progressData.eventProg as stat}
                <div class="m-[15px] flex flex-col gap-[7px]">
                    <div class="flex items-baseline justify-between">
                        <span class="text-[13px] font-medium text-foreground">{stat.label}</span>
                        <span class="text-xs text-muted-foreground">{stat.value} / {stat.total}</span>
                    </div>
                    <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            class="h-full rounded-full transition-[width] duration-400 ease-out"
                            style:width="{(stat.value / stat.total) * 100}%"
                            style:background={stat.color ?? 'var(--chart-1)'}
                        ></div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Team Progress -->
    {#if showAll && progressData.teamProg}
        <button class={toggleClass} onclick={() => showTeam = !showTeam}>
            <span>Team Progress</span>
            <ChevronDown
                class="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300"
                style="transform: rotate({showTeam ? 180 : 0}deg)"
            />
        </button>
        {#if showTeam}
            <div class={panelClass} transition:slide={{ duration: 350 }}>
                {#each progressData.teamProg.bars as stat}
                    <div class="m-[15px] flex flex-col gap-[7px]">
                        <div class="flex items-baseline justify-between">
                            <span class="text-[13px] font-medium text-foreground">{stat.label}</span>
                            <span class="text-xs text-muted-foreground">{stat.value} / {stat.total}</span>
                        </div>
                        <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                                class="h-full rounded-full transition-[width] duration-400 ease-out"
                                style:width="{(stat.value / stat.total) * 100}%"
                                style:background={stat.color ?? 'var(--chart-4)'}
                            ></div>
                        </div>
                    </div>
                {/each}

                <div class="m-[15px] flex flex-col gap-[7px]">
                    <div class="flex items-baseline justify-between">
                        <span class="text-[13px] font-medium text-foreground">Contributions</span>
                    </div>

                    <PieChart progressData={progressData} showTeam={showTeam} />
                </div>
            </div>
        {/if}
    {/if}

</div>
