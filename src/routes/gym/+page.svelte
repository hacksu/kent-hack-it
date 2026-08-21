<script lang="ts">
    import ChallengeFilters from '$lib/components/challenge-filters.svelte';
    import ChallengePanel from '$lib/components/challenge.panel.svelte';
    import ChallengesProgressBar from '$lib/components/challenges-progress-bar.svelte';
    import CategoryStrengthChart from '$lib/components/category-strength-chart.svelte';

    import { type ViewableChallengeData } from '$lib/database/db.js';
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    import { Button } from "$lib/components/ui/button";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
    import Check from "@lucide/svelte/icons/check";
    import ChevronDown from "@lucide/svelte/icons/chevron-down";

    let showCategoryBreakdown = $state(false);

    let error = $state("");
    let warning = $state("");
    let success = $state("");

    let instance_infomation = $state("");

    let otherInstanceActive = $state(false);

    let ssh_active = $state(false);
    let ssh_host = $state("");
    let ssh_port = $state<number|undefined>(undefined);
    let ssh_password = $state("");
    let ssh_expires_at = $state<Date|undefined>(undefined);
    let ssh_command = $derived(`ssh ctf-player@${ssh_host} -p ${ssh_port}`);

    let web_active = $state(false);
    let web_host = $state("");
    let web_port = $state<number|undefined>(undefined);
    let web_url = $derived(`http://${web_host}:${web_port}`);

    function clearResult() {
        error = warning = success = "";
    }

    const { data } = $props();

    let currentPage = $state(1);
    const challengesPerPage = 20;

    let challenges = $state<ViewableChallengeData[]>([]);

    function InTeam() {
        return data.completions?.team.length > 0;
    };
    function HasTeamCompleted(cid: any) {
        return data.completions?.team.some(
                (chall: Number) => Number(cid) === Number(chall)
            ) ?? false;
    }

    function hasSolved(cid: number) {
        return data.completions?.user?.some(
                (chall: any) => cid === Number(chall.challenge_id)
            ) ?? false;
    }

    function hasRated(cid: number) {
        return data.rated?.some(
            (ch_r) => cid === ch_r
        ) ?? false;
    }

    $effect(() => {
        challenges;
        currentPage = 1;
    });

    let totalPages = $derived(
        Math.max(
            1,
            Math.ceil(challenges.length / challengesPerPage)
        )
    );

    let indexOfLast = $derived(
        currentPage * challengesPerPage
    );

    let indexOfFirst = $derived(
        indexOfLast - challengesPerPage
    );

    let currentChallenges = $derived(
        challenges.slice(indexOfFirst, indexOfLast)
    );

    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
        }
    }

    let showPanel = $state<boolean>(false);

    let challengeInfo = $state<ViewableChallengeData | undefined>(
        undefined
    );

    async function viewChallenge(cid: string | number) {
        const challenge = challenges.find(
            (c) => Number(c.id) === Number(cid)
        );

        challengeInfo = challenge;
        otherInstanceActive = false;

        try {
            const req = await fetch(`/api/cinstance?cid=${cid}`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                cache: "no-store"
            });
            const res: {
                active: boolean,
                host?: string,
                rport?: number,
                created_at?: Date,
                other_active?: boolean
            } = await req.json();

            instance_infomation = (res.active) ? `nc ${res.host} ${res.rport}` : "";
            instanceStart = res.created_at;
            if (res.other_active) otherInstanceActive = true;
        } catch {}

        try {
            const sshReq = await fetch(`/api/sshinstance?cid=${cid}`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                cache: "no-store"
            });
            const sshRes: {
                active: boolean,
                host?: string,
                port?: number,
                password?: string,
                expires_at?: string,
                other_active?: boolean
            } = await sshReq.json();

            ssh_active = sshRes.active;
            ssh_host = sshRes.host ?? "";
            ssh_port = sshRes.port;
            ssh_password = sshRes.password ?? "";
            ssh_expires_at = sshRes.expires_at ? new Date(sshRes.expires_at) : undefined;
            if (sshRes.other_active) otherInstanceActive = true;
        } catch {}

        try {
            const webReq = await fetch(`/api/webinstance?cid=${cid}`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                cache: "no-store"
            });
            const webRes: {
                active: boolean,
                host?: string,
                port?: number,
            } = await webReq.json();

            web_active = webRes.active;
            web_host = webRes.host ?? "";
            web_port = webRes.port;
        } catch {}

        showPanel = challenge !== undefined;
    }

    let timeLeft = $state("00:00");
    let instanceLabel = $state("Time Remaining:");
    let timer: NodeJS.Timeout|undefined = undefined;
    let instanceStart = $state<Date|undefined>(undefined);

    function updateInstanceTimer() {
        if (!instanceStart) return;

        const now = new Date().getTime();
        const start = new Date(instanceStart).getTime();
        const end = start + 15 * 60 * 1000; // 15 minutes after start

        let distance;

        if (now < start) {
            instanceLabel = "Time Remaining::";
            distance = start - now;
        } else if (now < end) {
            instanceLabel = "Time Remaining::";
            distance = end - now;
        } else {
            timeLeft = "00:00";
            clearInterval(timer);
            return;
        }

        const totalSeconds = Math.floor(distance / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        timeLeft = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    let sshTimeLeft = $state("00:00");
    let sshTimer: NodeJS.Timeout|undefined = undefined;

    function updateSSHTimer() {
        if (!ssh_expires_at) return;

        const distance = new Date(ssh_expires_at).getTime() - Date.now();

        if (distance <= 0) {
            sshTimeLeft = "00:00";
            return;
        }

        const totalSeconds = Math.floor(distance / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        sshTimeLeft = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    onMount(() => {
        updateInstanceTimer();
        timer = setInterval(updateInstanceTimer, 1000);

        updateSSHTimer();
        sshTimer = setInterval(updateSSHTimer, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(sshTimer);
        };
    });

    // Styling helper: maps a challenge difficulty to a badge color, mirroring
    // the previous Bootstrap bg-danger/bg-warning/bg-info/bg-success ramp.
    function difficultyBadgeClass(difficulty: string) {
        switch (difficulty) {
            case 'Extreme': return 'border-destructive/30 bg-destructive/15 text-destructive';
            case 'Hard': return 'border-amber-400/30 bg-amber-400/15 text-amber-400';
            case 'Medium': return 'border-brand-blue/30 bg-brand-blue/15 text-brand-blue';
            case 'Easy': return 'border-brand-green/30 bg-brand-green/15 text-brand-green';
            default: return 'border-border bg-muted text-muted-foreground';
        }
    }

    function difficultyEdgeClass(difficulty: string) {
        switch (difficulty) {
            case 'Extreme': return 'bg-destructive';
            case 'Hard': return 'bg-amber-400';
            case 'Medium': return 'bg-brand-blue';
            case 'Easy': return 'bg-brand-green';
            default: return 'bg-muted-foreground';
        }
    }

    const overallProg = $derived(data.progressData?.totalProg?.[0] ?? { value: 0, total: 0 });
    const categoryProg = $derived(data.progressData?.totalProg?.slice(1) ?? []);

</script>

<ChallengePanel
    bind:showPanel
    bind:success
    bind:warning
    bind:error
    {challengeInfo}
    {instance_infomation}
    {instanceLabel}
    {timeLeft}
    {otherInstanceActive}
    {ssh_active}
    {ssh_command}
    {ssh_password}
    {sshTimeLeft}
    {web_active}
    {web_url}
    {hasRated}
    {hasSolved}
    {difficultyBadgeClass}
    {clearResult}
    onViewChallenge={viewChallenge}
/>

<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">

    <div class="mb-6">
        <div class="rounded-2xl border border-border bg-card">
            <div class="border-b border-border px-4 py-3 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Your progress
            </div>
            <ChallengesProgressBar solved={overallProg.value} total={overallProg.total} />
            <button
                type="button"
                class="flex w-full items-center justify-between border-t border-border px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                onclick={() => showCategoryBreakdown = !showCategoryBreakdown}
            >
                <span>Category Breakdown</span>
                <ChevronDown
                    class="h-3.5 w-3.5 transition-transform duration-300"
                    style="transform: rotate({showCategoryBreakdown ? 180 : 0}deg)"
                />
            </button>
            {#if showCategoryBreakdown}
                <div transition:slide={{ duration: 250 }}>
                    <CategoryStrengthChart categories={categoryProg} />
                </div>
            {/if}
        </div>

        <div class="mt-4 text-center">
            <h2 class="font-mono text-2xl font-bold text-foreground">Welcome to the Gym</h2>

            <details class="mx-auto mt-2 max-w-2xl text-left">
                <summary class="cursor-pointer text-center text-sm font-light text-muted-foreground select-none">
                    What's here?
                </summary>

                <div class="mt-3 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                    <p class="mb-2">
                        The Gym is a place for practicing, learning, and improving your skills.
                    </p>

                    <p class="mb-2">
                        After events end event challenges are retired here, so you can continue solving them at your own pace.
                    </p>

                    <p class="mb-0">
                        Think of it as an archive of past KHI challenges learning and skill development.
                    </p>

                    <p class="mb-0">
                        <i>
                            If you were on a team for KHI your teams completions are not counted here, meaning this page will show you
                            what challenges you either have or have not completed.
                        </i>
                        Feel free to communicate on our Discord or view our
                        <a
                            href="https://github.com/hacksu/Kent-Hack-It-Released"
                            target="_blank"
                            class="text-brand-blue! underline underline-offset-4 hover:text-brand-green!"
                        >author's solutions</a> if you looking for help!
                    </p>
                </div>
            </details>
        </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">

        <!-- Filter Sidebar -->
        <ChallengeFilters
            challenges={data.challenges ?? []}
            bind:filtered={challenges}
            completions={data.completions}
            showCompletionFilters={true}
            showHelpButton={true}
        />

        <!-- Main Content -->
        <div class="flex flex-col">
            <div class="flex-1">
                {#if currentChallenges.length > 0}
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {#each currentChallenges as challenge, idx (challenge.id ?? idx)}
                            <button
                                type="button"
                                class="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-blue/40"
                                onclick={ () => { viewChallenge(challenge.id) } }
                            >
                                <span class="absolute inset-x-0 top-0 h-[3px] {difficultyEdgeClass(challenge.difficulty)}"></span>

                                {#if !challenge.is_active}
                                    <div class="mt-1 mb-3 flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
                                        <TriangleAlert class="h-4.5 w-4.5 shrink-0 text-amber-400" />

                                        <div>
                                            <div class="text-sm font-semibold text-amber-300">
                                                Challenge Offline
                                            </div>

                                            <p class="text-xs text-muted-foreground">
                                                This challenge is currently out-of-order and will return soon.
                                            </p>
                                        </div>
                                    </div>
                                {/if}

                                <div class="{!challenge.is_active ? 'opacity-50' : ''} mt-1">
                                    <div class="flex items-start justify-between gap-2">
                                        <h6 class="text-sm font-semibold text-foreground">{challenge.name}</h6>
                                        {#if hasSolved(challenge.id)}
                                            <span
                                                class="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-brand-green text-[#08131f]"
                                                title="You solved this"
                                            >
                                                <Check class="h-3 w-3" />
                                            </span>
                                        {/if}
                                    </div>

                                    {#if challenge.description}
                                        <p class="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                                            {challenge.description}
                                        </p>
                                    {/if}

                                    <div class="mt-2 flex flex-wrap gap-1.5">
                                        <span class="rounded-full border border-brand-blue/30 bg-brand-blue/15 px-2 py-0.5 text-[0.65rem] font-medium text-brand-blue">
                                            {challenge.category}
                                        </span>
                                        <span class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium {difficultyBadgeClass(challenge.difficulty)}">
                                            {challenge.difficulty}
                                        </span>
                                    </div>

                                    <p class="mt-2 text-xs text-brand-blue">
                                        By: {challenge.written_by || 'Unknown Author'}
                                    </p>

                                    <div class="mt-2 flex items-center justify-between text-xs text-foreground">
                                        <span>⭐ {Number(challenge.rating).toFixed(1)} / 5</span>
                                        <span>{challenge.points} pts</span>
                                    </div>
                                    <p class="mt-0.5 text-xs text-muted-foreground">{challenge.solves} Solves</p>
                                </div>
                            </button>
                        {/each}
                    </div>
                {:else}
                    <div class="flex min-h-[300px] items-center justify-center text-center">
                        <div>
                            <h4 class="text-lg font-medium text-muted-foreground">No challenges found</h4>
                            <p class="text-sm text-muted-foreground">Try adjusting your filters to see more challenges.</p>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Pagination -->
            <div class="mt-4 py-3">
                <div class="flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm" onclick={prevPage} disabled={currentPage === 1}>
                        ← Prev
                    </Button>
                    <div class="flex flex-col items-center gap-1.5">
                        <span class="font-mono text-xs text-muted-foreground">
                            {Math.min(indexOfFirst + 1, challenges.length)}–{Math.min(indexOfLast, challenges.length)} of {challenges.length}
                        </span>
                        <div class="flex items-center gap-1">
                            {#each Array(totalPages) as _, i}
                                <span class="h-1.5 rounded-full transition-all {i + 1 === currentPage ? 'w-4 bg-brand-green' : 'w-1.5 bg-border'}"></span>
                            {/each}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onclick={nextPage} disabled={indexOfLast >= challenges.length}>
                        Next →
                    </Button>
                </div>
            </div>

        </div>
    </div>
    <div class="pb-5"></div>
</main>
