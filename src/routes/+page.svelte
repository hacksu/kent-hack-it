<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Accordion from "$lib/components/ui/accordion";
    import ArrowRight from "@lucide/svelte/icons/arrow-right";
    import Flag from "@lucide/svelte/icons/flag";
    import Users from "@lucide/svelte/icons/users";
    import Trophy from "@lucide/svelte/icons/trophy";

    const { data } = $props();

    // Countdown timer
    type Part = { value: string; unit: string };
    let parts = $state<Part[]>([]);
    let countdownLabel = $state("");

    let timer: NodeJS.Timeout|undefined = undefined;

    function toParts(distance: number): Part[] {
        const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const pad = (n: number) => String(n).padStart(2, "0");
        return [
            { value: String(days), unit: "days" },
            { value: pad(hours), unit: "hrs" },
            { value: pad(minutes), unit: "min" },
            { value: pad(seconds), unit: "sec" },
        ];
    }

    function updateCountdown() {
        if (!data.eventStartDate || !data.eventEndDate) {
            parts = [];
            countdownLabel = "";
            clearInterval(timer);
            return;
        }

        const now = new Date().getTime();
        const start = new Date(data.eventStartDate).getTime();
        const end = new Date(data.eventEndDate).getTime();

        if (now < start) {
            countdownLabel = "Event starts in";
            parts = toParts(start - now);
        } else if (now >= start && now < end) {
            countdownLabel = "Event ends in";
            parts = toParts(end - now);
        } else {
            countdownLabel = "This year's event has ended";
            parts = [];
            clearInterval(timer);
        }
    }

    onMount(() => {
        updateCountdown();
        timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    });

    const live = $derived(countdownLabel === "Event ends in");

    // Dynamic event year info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const eventYear = currentMonth < 9 ? currentYear : currentYear + 1;
    const eventMonthLabel = currentMonth < 9 ? "this" : "next";

    const highlights = [
        {
            icon: Flag,
            title: "Solve challenges",
            body: "Cryptography, web security, forensics, reverse engineering and more, from beginner-friendly to advanced.",
        },
        {
            icon: Users,
            title: "Team up",
            body: "Compete solo or with up to four people. Team leaders approve who joins.",
        },
        {
            icon: Trophy,
            title: "Climb the leaderboard",
            body: "Every flag you capture earns points. Watch the score race play out over the week.",
        },
    ];
</script>

{#snippet faq(question: string)}
    <Accordion.Trigger class="items-center rounded-none px-5 py-4 text-[0.9375rem] hover:bg-accent/40 hover:no-underline">
        {question}
    </Accordion.Trigger>
{/snippet}

<main class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-14">
        <!-- Faint grid, fading out toward the bottom -->
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-50 [mask-image:radial-gradient(ellipse_80%_90%_at_50%_0%,black,transparent)]"
        ></div>

        <div class="relative mx-auto max-w-2xl text-center">
            <p class="eyebrow inline-flex items-center gap-2">
                {#if live}
                    <span class="relative flex size-2">
                        <span class="absolute inline-flex size-full animate-ping rounded-full bg-brand-green opacity-60"></span>
                        <span class="relative inline-flex size-2 rounded-full bg-brand-green"></span>
                    </span>
                    <span class="text-brand-green">Live now</span>
                    <span aria-hidden="true">/</span>
                {/if}
                HacKSU Capture The Flag
            </p>

            <h1 class="text-brand-gradient mx-auto mt-4 w-fit text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                Kent Hack It
            </h1>

            <p class="mx-auto mt-5 max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
                Break in, capture flags, and climb the leaderboard. A week-long CTF built by the HacKSU club for every skill level.
            </p>

            <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                {#if data.user}
                    <Button href="/compete" size="lg" class="h-11 px-5 text-[0.9375rem]">
                        Go to challenges
                        <ArrowRight />
                    </Button>
                {:else}
                    <Button href="/auth/login" size="lg" class="h-11 px-5 text-[0.9375rem]">
                        Register
                        <ArrowRight />
                    </Button>
                {/if}
                <Button href="/leaderboard" variant="outline" size="lg" class="h-11 px-5 text-[0.9375rem]">
                    View leaderboard
                </Button>
            </div>

            <!-- Countdown -->
            {#if countdownLabel}
                <div class="mt-10 flex flex-col items-center gap-3">
                    <p class="eyebrow">{countdownLabel}</p>
                    {#if parts.length > 0}
                        <div class="flex items-stretch gap-2 sm:gap-3" role="timer" aria-label={countdownLabel}>
                            {#each parts as part (part.unit)}
                                <div class="flex w-16 flex-col items-center rounded-xl border border-border bg-background/60 py-2.5 sm:w-20 sm:py-3">
                                    <span class="font-mono text-2xl font-semibold text-foreground tabular-nums sm:text-3xl">{part.value}</span>
                                    <span class="eyebrow mt-0.5 text-[0.625rem]">{part.unit}</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </section>

    <!-- Highlights -->
    <section class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {#each highlights as item (item.title)}
            {@const Icon = item.icon}
            <div class="rounded-xl border border-border bg-card p-5">
                <Icon class="size-5 text-brand-green" />
                <h2 class="mt-3 text-sm font-semibold text-foreground">{item.title}</h2>
                <p class="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
        {/each}
    </section>

    <!-- About -->
    <section class="mt-14 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-[200px_1fr]">
        <div>
            <p class="eyebrow">About</p>
            <h2 class="mt-1.5 text-xl font-semibold tracking-tight text-foreground">What is KHI?</h2>
        </div>
        <div class="max-w-2xl space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <p>
                KHI is a <a href="https://hacksu.com/" class="link">HacKSU</a> sponsored Capture The Flag (CTF)
                competition, where Computer Science and Cyber Security enthusiasts can connect with others and
                compete together to tackle challenges built by the HacKSU club!
            </p>
            <p>
                Whether you're a beginner looking to learn or an experienced hacker aiming to test your skills,
                KHI offers a variety of challenges that cater to all skill levels. Join us for an exciting week
                of problem-solving, teamwork, and fun!
            </p>
            <p class="rounded-lg border border-brand-green/25 bg-brand-green/8 px-4 py-3 text-foreground">
                Our {eventYear} event will take place in {eventMonthLabel} October. More details to come soon.
            </p>
            <p>
                Interested in other HacKSU events? Check out our yearly hackathon
                <a href="https://khe.io" class="link">KHE</a>. Want to support HacKSU? Grab something from our
                <a href="https://www.redbubble.com/people/KentStateCS/shop" class="link">Merch Store</a>.
            </p>
        </div>
    </section>

    <!-- FAQ -->
    <section class="mt-14 mb-8 grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-[200px_1fr]">
        <div>
            <p class="eyebrow">FAQ</p>
            <h2 class="mt-1.5 text-xl font-semibold tracking-tight text-foreground">Common questions</h2>
        </div>
        <Accordion.Root type="single" class="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
            <Accordion.Item value="faq-1">
                {@render faq("What is a Capture The Flag (CTF) competition?")}
                <Accordion.Content class="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    CTF competitions are events where participants solve security-related challenges to find
                    "flags" and earn points. These challenges test various cybersecurity skills including
                    cryptography, web security, forensics, and reverse engineering.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-2">
                {@render faq("Do I need to be an expert to participate?")}
                <Accordion.Content class="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    Not at all! CTFs are designed for all skill levels, and we encourage everyone to join and
                    learn. We have challenges ranging from beginner-friendly to advanced levels.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-3">
                {@render faq("How can I prepare for the competition?")}
                <Accordion.Content class="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        We recommend practicing with online CTF platforms like OverTheWire, PicoCTF, or
                        HackTheBox. Review common security topics and join our Discord for tips and discussions!
                    </p>
                    <p>
                        <strong class="font-medium text-foreground">Some challenges might use Kali Linux for completion!</strong>
                        Check out our <a href="/kali-setup-guide" class="link">Kali Linux VM Setup Guide</a>.
                    </p>
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-4">
                {@render faq("How many people can be on a team?")}
                <Accordion.Content class="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    Teams can have up to 4 members. We encourage collaboration and teamwork! You can also
                    participate individually if you prefer.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-5">
                {@render faq("How do I create or join a team on your site?")}
                <Accordion.Content class="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                    After registering and logging in, open the <strong class="font-medium text-foreground">Team</strong>
                    page from the sidebar. There you can create a new team or request to join an existing one.
                    Team leaders approve requests, and teams are limited to 4 members.
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </section>
</main>
