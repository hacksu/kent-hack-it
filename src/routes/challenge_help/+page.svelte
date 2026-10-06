<script lang="ts">
    import CommandLine from "$lib/components/command-line.svelte";
    import PageHeader from "$lib/components/page-header.svelte";
</script>

<main class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Help"
        title="Confused with a challenge?"
        description="A quick primer on connecting to challenge endpoints, and what to do when you get stuck."
    />

    <div class="space-y-4">
        <section class="rounded-xl border border-border bg-card p-5">
            <h2 class="text-base font-semibold text-foreground">Connecting to a remote endpoint</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                Some challenges offer remote endpoints such as
                <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground">rev.ctf.hacksu.com:2530</code>.
                To interact with this endpoint, use <em>netcat</em> (<code class="font-mono text-foreground">nc</code>) from your
                <a href="/kali-setup-guide" class="link">Kali Linux</a> or other Unix shell.
            </p>
            <CommandLine value="nc rev.ctf.hacksu.com 2530" class="mt-4 max-w-md" />
        </section>

        <section class="rounded-xl border border-border bg-card p-5">
            <h2 class="text-base font-semibold text-foreground">Stuck?</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
                Don't get frustrated if you get stuck — there are lots of challenges to try.
                Ask for hints, search around, or try ChatGPT — we're all learning!
            </p>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
                You can also ask in our <a href="/discord" target="_blank" rel="noopener noreferrer" class="link">Discord</a>.
            </p>
        </section>
    </div>
</main>
