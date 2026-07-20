<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Accordion from "$lib/components/ui/accordion";
    import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
    import ArrowRight from "@lucide/svelte/icons/arrow-right";
    import CalendarDays from "@lucide/svelte/icons/calendar-days";
    import ShoppingBag from "@lucide/svelte/icons/shopping-bag";
    import MessageSquare from "@lucide/svelte/icons/message-square";
    import Wrench from "@lucide/svelte/icons/wrench";

    const { data } = $props();

    // Countdown timer
    let timeLeft = $state("Loading...");
    let countdownLabel = $state("Event starts in:");

    let timer: NodeJS.Timeout|undefined = undefined;
    let showTimer = $state(true);

    function updateCountdown() {
        const now = new Date().getTime();
        const start = new Date(data.eventStartDate).getTime();
        const end = new Date(data.eventEndDate).getTime();

        if (now < start) {
            countdownLabel = "Event starts in:";
            const distance = start - now;
            const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (now >= start && now < end) {
            countdownLabel = "Event ends in:";
            const distance = end - now;
            const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            countdownLabel = "Event over";
            timeLeft = "";
            showTimer = false;
            clearInterval(timer);
        }
    }

    onMount(() => {
        updateCountdown();
        timer = setInterval(updateCountdown, 1000);
    });

    // Dynamic event year info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const eventYear = currentMonth < 9 ? currentYear : currentYear + 1;
    const eventMonthLabel = currentMonth < 9 ? "this" : "next";

    const linkClass =
        "font-medium text-brand-blue! underline underline-offset-4 decoration-brand-blue/40 hover:text-brand-green! hover:decoration-brand-green/60";

    const quickLinks = [
        {
            href: "https://khe.io",
            title: "KHE Hackathon",
            description: "Our yearly HacKSU hackathon. Build something in a weekend.",
            icon: CalendarDays,
            external: true
        },
        {
            href: "https://www.redbubble.com/people/KentStateCS/shop",
            title: "Merch Store",
            description: "Grab HacKSU gear and help support the club.",
            icon: ShoppingBag,
            external: true
        },
        {
            href: "/discord",
            title: "Community",
            description: "Join the Discord for tips, teammates, and announcements.",
            icon: MessageSquare,
            external: true
        },
        {
            href: "/tools",
            title: "Tools",
            description: "Handy utilities for working through CTF challenges.",
            icon: Wrench,
            external: true
        }
    ];
</script>

{#snippet eyebrow(label: string)}
    <div class="mb-4 flex items-center gap-2.5">
        <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
        <span class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">{label}</span>
    </div>
{/snippet}

<main class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-10">
    <!-- Featured status panel (hero) -->
    <section
        class="relative overflow-hidden rounded-2xl border border-brand-blue/25 bg-gradient-to-br from-brand-green/12 via-card to-brand-blue/14 p-6 shadow-glow-blue sm:p-9"
    >
        <!-- Ambient brand glow + grid, kept subtle behind the content -->
        <div
            aria-hidden="true"
            class="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-brand-green/20 blur-[110px]"
        ></div>
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--brand-blue)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-blue)_10%,transparent)_1px,transparent_1px)] bg-[size:46px_46px] opacity-40 [mask-image:radial-gradient(ellipse_70%_90%_at_15%_0%,black,transparent)]"
        ></div>

        <div class="relative max-w-2xl">
            <div class="mb-4 flex flex-wrap items-center gap-3">
                <span class="font-mono text-xs font-medium tracking-[0.2em] text-brand-blue uppercase">
                    HacKSU CTF · {eventYear}
                </span>
                <span
                    class="inline-flex items-center gap-1.5 rounded-full border border-brand-green/40 bg-brand-green/10 px-2.5 py-0.5 font-mono text-[0.65rem] font-medium tracking-wide text-brand-green uppercase"
                >
                    <span class="h-1.5 w-1.5 rounded-full bg-brand-green"></span>
                    Registration open
                </span>
            </div>

            <h1
                class="bg-gradient-to-r from-[#61cf5a] to-[#4a9eff] bg-clip-text font-mono text-4xl font-extrabold tracking-tight text-transparent drop-shadow-[0_0_28px_rgba(97,207,90,0.2)] sm:text-6xl"
            >
                KENT HACK IT
            </h1>

            <p class="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
                A HacKSU Capture The Flag competition. Break in, capture flags, and climb the leaderboard.
            </p>

            <div class="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Button
                    href="/auth/login"
                    size="lg"
                    class="h-auto bg-gradient-to-r from-brand-green to-brand-blue px-7 py-3 text-base font-semibold text-[#08131f]! no-underline! shadow-glow hover:no-underline! hover:brightness-110"
                >
                    <ArrowRight class="h-5 w-5" />
                    Register Here
                </Button>

                <!-- Countdown: high-contrast pill -->
                <div class="flex flex-col gap-1.5">
                    <span class="font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                        {countdownLabel}
                    </span>
                    {#if showTimer}
                        <div
                            class="inline-flex items-center gap-3 rounded-xl border border-brand-green/35 bg-[#070d16] px-5 py-2.5 shadow-glow"
                        >
                            <span class="font-mono text-lg text-brand-blue select-none">$</span>
                            <span
                                class="font-mono text-2xl font-bold tracking-wide text-brand-green tabular-nums sm:text-[1.7rem]"
                            >
                                {timeLeft}
                            </span>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </section>

    <!-- Quick links: action cards -->
    <section class="mt-12">
        {@render eyebrow("Quick links")}
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {#each quickLinks as link (link.href)}
                {@const Icon = link.icon}
                <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    class="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 no-underline! transition-colors hover:border-brand-blue/50 hover:bg-accent/40 hover:no-underline!"
                >
                    <div
                        class="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-blue/25 bg-gradient-to-br from-brand-green/15 to-brand-blue/15 text-brand-blue transition-colors group-hover:text-brand-green"
                    >
                        <Icon class="h-5 w-5" />
                    </div>
                    <ArrowUpRight
                        class="absolute top-4 right-4 h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-green"
                    />
                    <div>
                        <p class="font-semibold text-foreground!">{link.title}</p>
                        <p class="mt-1 text-sm text-muted-foreground">{link.description}</p>
                    </div>
                </a>
            {/each}
        </div>
    </section>

    <!-- About Section -->
    <section class="mt-14">
        {@render eyebrow("About KHI")}
        <div class="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div class="max-w-3xl space-y-4 text-base leading-relaxed">
                <p>
                    KHI is a <a href="https://hacksu.com/" class={linkClass}>HacKSU</a> sponsored Capture The Flag (CTF)
                    competition, where Computer Science and Cyber Security enthusiasts can connect with others and
                    compete together to tackle challenges built by the HacKSU club!
                </p>
                <p>
                    Whether you're a beginner looking to learn or an experienced hacker aiming to test your skills,
                    KHI offers a variety of challenges that cater to all skill levels. Join us for an exciting week
                    of problem-solving, teamwork, and fun!
                </p>
                <p class="text-brand-green">
                    Our {eventYear} event will take place in {eventMonthLabel} October. More details to come soon.
                </p>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="mt-14 mb-8">
        {@render eyebrow("FAQ")}
        <div class="rounded-2xl border border-border bg-card px-6 py-2 sm:px-8">
            <Accordion.Root type="single" class="w-full">
                <Accordion.Item value="faq-1">
                    <Accordion.Trigger>What is a Capture The Flag (CTF) competition?</Accordion.Trigger>
                    <Accordion.Content>
                        CTF competitions are events where participants solve security-related challenges to find
                        "flags" and earn points. These challenges test various cybersecurity skills including
                        cryptography, web security, forensics, and reverse engineering.
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="faq-2">
                    <Accordion.Trigger>Do I need to be an expert to participate?</Accordion.Trigger>
                    <Accordion.Content>
                        Not at all! CTFs are designed for all skill levels, and we encourage everyone to join and
                        learn. We have challenges ranging from beginner-friendly to advanced levels.
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="faq-3">
                    <Accordion.Trigger>How can I prepare for the competition?</Accordion.Trigger>
                    <Accordion.Content>
                        <p>
                            We recommend practicing with online CTF platforms like OverTheWire, PicoCTF, or
                            HackTheBox. Review common security topics and join our Discord for tips and discussions!
                        </p>
                        <p>
                            <strong>Some Challenges might use Kali Linux for completion!</strong> Check out our
                            <a href="/kali-setup-guide" class={linkClass}>Kali Linux VM Setup Guide</a>.
                        </p>
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="faq-4">
                    <Accordion.Trigger>How many people can be on a team?</Accordion.Trigger>
                    <Accordion.Content>
                        Teams can have up to 4 members. We encourage collaboration and teamwork! You can also
                        participate individually if you prefer.
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item value="faq-5">
                    <Accordion.Trigger>How do I create or join a team on your site?</Accordion.Trigger>
                    <Accordion.Content>
                        After registering and logging in, navigate to the <strong>Profile</strong> section, then
                        click <strong>Go to Team Page</strong>. There you can create a new team or join an existing
                        team. Team leaders approve requests. Teams limited to 4 members maximum.
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </div>
    </section>
</main>
