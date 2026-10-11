<script lang="ts">
    import ChallengeBrowser from '$lib/components/challenge-browser.svelte';
    import PageHeader from '$lib/components/page-header.svelte';
    import ProgressOverview from '$lib/components/progress-overview.svelte';

    import { Button } from "$lib/components/ui/button";
    import LifeBuoy from "@lucide/svelte/icons/life-buoy";

    const { data } = $props();

    const inTeam = $derived((data.completions?.team?.length ?? 0) > 0);
</script>

<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Live event"
        title="Compete"
        description="Solve challenges, submit flags, and earn points for your team."
    >
        {#snippet actions()}
            <Button href="/challenge_help" variant="outline">
                <LifeBuoy />
                Challenge help
            </Button>
        {/snippet}
    </PageHeader>

    <div class="flex flex-col gap-4">
        <ProgressOverview mine={data.progressData?.eventProg ?? []} team={data.progressData?.teamProg} />

        <ChallengeBrowser
            allChallenges={data.challenges ?? []}
            completions={data.completions}
            rated={data.rated}
            showTeam={inTeam}
        />
    </div>
</main>
