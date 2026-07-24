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
        if (!data.eventStartDate || !data.eventEndDate) {
            showTimer = false;
            clearInterval(timer);
            return;
        }

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

    // FAQ items are clean cards at rest (matching the About/hero cards); when
    // open they take the selected-nav brand gradient as their active state.
    // The numbered title row is the blue block; the expanding answer sits on a
    // darker neutral surface beneath it.
    const faqItemClass = "overflow-hidden rounded-2xl border border-transparent bg-[#141d33]";
    const faqTriggerClass =
        "w-full items-center justify-start gap-4 rounded-none bg-[#16223f] px-5 py-4 text-left text-base font-medium text-foreground! no-underline! transition-colors hover:bg-[#1e2d52] hover:no-underline! hover:text-foreground!";
    const faqContentClass =
        "border-t border-white/5 px-5 pt-4 pb-4 pl-14 text-left text-base leading-relaxed text-muted-foreground";
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
        class="relative overflow-hidden rounded-2xl border border-brand-blue/25 bg-gradient-to-br from-brand-green/12 via-card to-brand-blue/14 p-6 sm:p-9"
    >
        <!-- Ambient brand glow + grid, kept subtle behind the content -->
        <div
            aria-hidden="true"
            class="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-green/20 blur-[110px]"
        ></div>
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--brand-blue)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-blue)_10%,transparent)_1px,transparent_1px)] bg-[size:46px_46px] opacity-40 [mask-image:radial-gradient(ellipse_75%_90%_at_50%_0%,black,transparent)]"
        ></div>

        <div class="relative mx-auto max-w-2xl text-center">
            <!-- Terminal command prompt -->
            <p class="mb-5 font-mono text-sm break-all text-muted-foreground">
                <span class="text-brand-green">khi@hacksu</span><span>:</span><span class="text-brand-blue">~</span>
                <span>$ ./register.sh --ctf {eventYear}</span>
            </p>

            <h1
                class="mx-auto w-fit bg-gradient-to-r from-[#7bf078] via-[#61cf5a] to-[#5cb6ff] bg-clip-text font-mono text-[2rem] font-extrabold tracking-tight whitespace-nowrap text-transparent! drop-shadow-[0_1px_18px_rgba(92,182,255,0.35)] sm:text-5xl md:text-6xl"
            >
                KENT HACK IT
            </h1>

            <p class="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
                A HacKSU Capture The Flag competition. Break in, capture flags, and climb the leaderboard.
            </p>

            <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
                <Button
                    href="/auth/login"
                    size="lg"
                    class="h-14 gap-2 bg-gradient-to-r from-brand-green to-brand-blue px-7 text-base font-semibold text-[#08131f]! no-underline! shadow-glow hover:no-underline! hover:brightness-110"
                >
                    <ArrowRight class="h-5 w-5" />
                    Register Here
                </Button>

                <!-- Countdown: high-contrast pill, height-matched to the button -->
                <div class="flex flex-col items-center gap-1.5">
                    <span class="font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                        {countdownLabel}
                    </span>
                    {#if showTimer}
                        <div
                            class="inline-flex h-14 items-center gap-3 rounded-xl border border-brand-green/35 bg-[#070d16] px-5 shadow-glow"
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
            <div class="mx-auto max-w-3xl space-y-4 text-center text-base leading-relaxed text-muted-foreground">
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
        <Accordion.Root type="single" class="w-full space-y-3">
            <Accordion.Item value="faq-1" class={faqItemClass}>
                <Accordion.Trigger class={faqTriggerClass}>
                    <span class="font-mono text-xs text-brand-blue tabular-nums">01</span>
                    <span class="flex-1">What is a Capture The Flag (CTF) competition?</span>
                </Accordion.Trigger>
                <Accordion.Content class={faqContentClass}>
                    CTF competitions are events where participants solve security-related challenges to find
                    "flags" and earn points. These challenges test various cybersecurity skills including
                    cryptography, web security, forensics, and reverse engineering.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-2" class={faqItemClass}>
                <Accordion.Trigger class={faqTriggerClass}>
                    <span class="font-mono text-xs text-brand-blue tabular-nums">02</span>
                    <span class="flex-1">Do I need to be an expert to participate?</span>
                </Accordion.Trigger>
                <Accordion.Content class={faqContentClass}>
                    Not at all! CTFs are designed for all skill levels, and we encourage everyone to join and
                    learn. We have challenges ranging from beginner-friendly to advanced levels.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-3" class={faqItemClass}>
                <Accordion.Trigger class={faqTriggerClass}>
                    <span class="font-mono text-xs text-brand-blue tabular-nums">03</span>
                    <span class="flex-1">How can I prepare for the competition?</span>
                </Accordion.Trigger>
                <Accordion.Content class={faqContentClass}>
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

            <Accordion.Item value="faq-4" class={faqItemClass}>
                <Accordion.Trigger class={faqTriggerClass}>
                    <span class="font-mono text-xs text-brand-blue tabular-nums">04</span>
                    <span class="flex-1">How many people can be on a team?</span>
                </Accordion.Trigger>
                <Accordion.Content class={faqContentClass}>
                    Teams can have up to 4 members. We encourage collaboration and teamwork! You can also
                    participate individually if you prefer.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-5" class={faqItemClass}>
                <Accordion.Trigger class={faqTriggerClass}>
                    <span class="font-mono text-xs text-brand-blue tabular-nums">05</span>
                    <span class="flex-1">How do I create or join a team on your site?</span>
                </Accordion.Trigger>
                <Accordion.Content class={faqContentClass}>
                    After registering and logging in, navigate to the <strong>Profile</strong> section, then
                    click <strong>Go to Team Page</strong>. There you can create a new team or join an existing
                    team. Team leaders approve requests. Teams limited to 4 members maximum.
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </section>
</main>
