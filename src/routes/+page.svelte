<script lang="ts">
    import { onMount } from "svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Accordion from "$lib/components/ui/accordion";

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

    const linkClass = "text-primary underline underline-offset-4 hover:text-primary/80";
</script>

<main class="flex min-h-screen flex-col">
    <!-- Hero Section -->
    <section class="flex flex-1 flex-col items-center justify-center gap-7 px-4 py-20 text-center sm:py-28">
        <h1
            class="bg-gradient-to-r from-[#61cf5a] to-[#4a9eff] bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl"
        >
            KENT HACK IT
        </h1>

        <Button href="/auth/login" size="lg" class="h-auto min-w-[220px] px-8 py-3.5 text-lg font-semibold sm:text-xl">
            Register Here
        </Button>

        <div class="mt-2 flex flex-col items-center gap-2.5">
            <p class="text-sm font-medium tracking-wide text-muted-foreground uppercase">{countdownLabel}</p>
            {#if showTimer}
                <div
                    class="rounded-md border-2 border-accent bg-accent/5 px-6 py-3 font-mono text-2xl font-bold text-foreground sm:text-3xl dark:bg-accent/10"
                >
                    {timeLeft}
                </div>
            {/if}
        </div>
    </section>

    <!-- Main Content -->
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-16 px-4 pb-24 md:gap-20">
        <!-- About Section -->
        <section>
            <h2 class="mb-6 text-center text-2xl font-bold text-primary sm:text-3xl">About KHI</h2>

            <div class="mx-auto max-w-3xl space-y-4 text-center text-base leading-relaxed sm:text-lg">
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
                <p>Our {eventYear} Event will take place in {eventMonthLabel} October, more details to come soon!</p>
            </div>

            <div class="mt-10 grid gap-6 border-t border-border pt-8 md:grid-cols-2">
                <p class="text-center text-sm sm:text-base">
                    Interested in other HacKSU events? Check out our yearly hackathon
                    <a href="https://khe.io" class={linkClass}>KHE</a>.
                </p>
                <p class="text-center text-sm sm:text-base">
                    Want to help support HacKSU? Check out our
                    <a href="https://www.redbubble.com/people/KentStateCS/shop" class={linkClass}>Merch Store</a>!
                </p>
            </div>
        </section>

        <!-- FAQ Section -->
        <section class="border-t border-border pt-14 md:pt-20">
            <h2 class="mb-6 text-center text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>

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
                            <a href="/kali-setup-guide">Kali Linux VM Setup Guide</a>.
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
        </section>
    </div>
</main>
