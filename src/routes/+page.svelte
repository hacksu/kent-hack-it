<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Accordion from "$lib/components/ui/accordion";
    import ArrowRight from "@lucide/svelte/icons/arrow-right";

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
                class="w-fit bg-gradient-to-r from-[#7bf078] via-[#61cf5a] to-[#5cb6ff] bg-clip-text font-mono text-[2rem] font-extrabold tracking-tight whitespace-nowrap text-transparent! drop-shadow-[0_1px_18px_rgba(92,182,255,0.35)] sm:text-5xl md:text-6xl"
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

    <!-- About Section -->
    <section class="mt-12">
        {@render eyebrow("About KHI")}
        <div class="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div class="max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground">
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
                <p>
                    Interested in other HacKSU events? Check out our yearly hackathon
                    <a href="https://khe.io" class={linkClass}>KHE</a>. Want to support HacKSU? Grab something from our
                    <a href="https://www.redbubble.com/people/KentStateCS/shop" class={linkClass}>Merch Store</a>.
                </p>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="mt-14 mb-8">
        {@render eyebrow("FAQ")}
        <div class="rounded-2xl border border-border bg-card px-6 py-2 text-card-foreground sm:px-8">
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
