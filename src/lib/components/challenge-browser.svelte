<script lang="ts">
    import ChallengeCard from '$lib/components/challenge-card.svelte';
    import ChallengeFilters from '$lib/components/challenge-filters.svelte';
    import ChallengePanel from '$lib/components/challenge.panel.svelte';

    import { type ViewableChallengeData } from '$lib/database/db.js';
    import { onMount, untrack } from "svelte";

    import { Button } from "$lib/components/ui/button";
    import ChevronLeft from "@lucide/svelte/icons/chevron-left";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import SearchX from "@lucide/svelte/icons/search-x";

    const {
        allChallenges,
        completions = undefined,
        rated = undefined,
        showTeam = false,
    }: {
        allChallenges: ViewableChallengeData[];
        completions?: { user?: { challenge_id: number }[] | null; team?: number[] | null };
        rated?: number[] | null;
        /** Show team-solved markers and team progress filters. */
        showTeam?: boolean;
    } = $props();

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

    let currentPage = $state(1);
    const challengesPerPage = 20;

    // Seeded with the full list so the server render shows challenges; the
    // filters component takes over through its `filtered` binding.
    let challenges = $state<ViewableChallengeData[]>(untrack(() => allChallenges));

    function hasTeamCompleted(cid: number) {
        return completions?.team?.some(
                (chall) => Number(cid) === Number(chall)
            ) ?? false;
    }

    function hasSolved(cid: number) {
        return completions?.user?.some(
                (chall) => cid === Number(chall.challenge_id)
            ) ?? false;
    }

    function hasRated(cid: number) {
        return rated?.some(
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
    let timer: NodeJS.Timeout|undefined = undefined;
    let instanceStart = $state<Date|undefined>(undefined);

    function updateInstanceTimer() {
        if (!instanceStart) return;

        const now = new Date().getTime();
        const start = new Date(instanceStart).getTime();
        const end = start + 15 * 60 * 1000; // 15 minutes after start

        let distance;

        if (now < start) {
            distance = start - now;
        } else if (now < end) {
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
</script>

<ChallengePanel
    bind:showPanel
    bind:success
    bind:warning
    bind:error
    {challengeInfo}
    {instance_infomation}
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
    {clearResult}
    onViewChallenge={viewChallenge}
/>

<div class="flex flex-col gap-4">
    <ChallengeFilters
        challenges={allChallenges}
        bind:filtered={challenges}
        {completions}
        showCompletionFilters={true}
        showTeamFilters={showTeam}
    />

    {#if currentChallenges.length > 0}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {#each currentChallenges as challenge, idx (challenge.id ?? idx)}
                <ChallengeCard
                    {challenge}
                    solved={hasSolved(challenge.id)}
                    teamSolved={showTeam && hasTeamCompleted(challenge.id)}
                    onclick={() => viewChallenge(challenge.id)}
                />
            {/each}
        </div>
    {:else}
        <div class="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 text-center">
            <SearchX class="size-6 text-muted-foreground" />
            <p class="mt-3 text-sm font-medium text-foreground">No challenges found</p>
            <p class="mt-1 text-sm text-muted-foreground">Try adjusting your filters to see more challenges.</p>
        </div>
    {/if}

    {#if totalPages > 1}
        <nav class="flex items-center justify-between gap-4 pt-1" aria-label="Pagination">
            <span class="text-xs text-muted-foreground tabular-nums">
                {Math.min(indexOfFirst + 1, challenges.length)}–{Math.min(indexOfLast, challenges.length)} of {challenges.length}
            </span>
            <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" onclick={prevPage} disabled={currentPage === 1}>
                    <ChevronLeft />
                    Prev
                </Button>
                <span class="px-1 text-xs text-muted-foreground tabular-nums">
                    Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onclick={nextPage} disabled={indexOfLast >= challenges.length}>
                    Next
                    <ChevronRight />
                </Button>
            </div>
        </nav>
    {/if}
</div>
