<script lang="ts">
    import ChallengeBrowser from '$lib/components/challenge-browser.svelte';
    import PageHeader from '$lib/components/page-header.svelte';
    import ProgressOverview from '$lib/components/progress-overview.svelte';

    import { Button } from "$lib/components/ui/button";
    import LifeBuoy from "@lucide/svelte/icons/life-buoy";

    const { data } = $props();
</script>

<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Practice"
        title="Gym"
        description="An archive of past KHI challenges. After an event ends its challenges retire here, so you can keep solving them at your own pace."
    >
        <details class="group mt-2 max-w-2xl text-sm text-muted-foreground">
            <summary class="w-fit list-none font-medium text-brand-blue select-none hover:underline [&::-webkit-details-marker]:hidden">
                <span class="group-open:hidden">How does the Gym work?</span>
                <span class="hidden group-open:inline">Hide details</span>
            </summary>
            <div class="mt-2 space-y-2 leading-relaxed">
                <p>
                    Progress here is individual. If you were on a team for KHI, your team's completions are
                    not counted, so this page shows which challenges you personally have and have not solved.
                </p>
                <p>
                    Stuck? Ask on our Discord or read the
                    <a
                        href="https://github.com/hacksu/Kent-Hack-It-Released"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link"
                    >authors' solutions</a>.
                </p>
            </div>
        </details>
        {#snippet actions()}
            <Button href="/challenge_help" variant="outline">
                <LifeBuoy />
                Challenge help
            </Button>
        {/snippet}
    </PageHeader>

    <div class="flex flex-col gap-4">
        <ProgressOverview mine={data.progressData?.totalProg ?? []} />

        <ChallengeBrowser
            allChallenges={data.challenges ?? []}
            completions={data.completions}
            rated={data.rated}
        />
    </div>
</main>
