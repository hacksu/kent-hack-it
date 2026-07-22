<script lang="ts">
    import { Button } from "$lib/components/ui/button";

    const linkClass =
        "font-medium text-brand-blue! underline underline-offset-4 decoration-brand-blue/40 hover:text-brand-green! hover:decoration-brand-green/60";
</script>

<main class="mx-auto w-full max-w-2xl px-4 py-12 text-center sm:px-6 md:py-16">
    <h1 class="font-mono text-3xl font-bold text-foreground sm:text-4xl">Confused with a Challenge?</h1>

    <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Some challenges offer remote endpoints such as <strong>rev.ctf.hacksu.com:2530</strong>.<br />
        To interact with this endpoint, use <em>netcat</em> (nc) from your
        <a href="/kali-setup-guide" class={linkClass}>Kali Linux</a> or other Unix shell.
    </p>

    <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <div
            class="inline-flex min-w-[280px] items-center gap-2.5 rounded-xl border border-brand-green/30 bg-[#070d16] px-4 py-2.5 shadow-glow"
        >
            <span class="font-mono text-sm text-brand-blue select-none">$</span>
            <code
                class="cli-command font-mono text-sm whitespace-nowrap text-foreground"
                id="nc-command"
                aria-label="Unix command: nc rev.ctf.hacksu.com 2530"
            >
                nc rev.ctf.hacksu.com 2530
            </code>
        </div>

        <Button
            variant="outline"
            size="sm"
            onclick={() => {
                const el = document.getElementById("nc-command");
                if (!el) return;
                const btn = document.activeElement;
                navigator.clipboard?.writeText(el.textContent || "")
                    .then(() => {
                    if (btn && btn.tagName === 'BUTTON') {
                        const originalText = btn.textContent;
                        btn.textContent = "Copied!";
                        setTimeout(() => (btn.textContent = originalText), 1200);
                    }
                    })
                    .catch(() => alert("Copy failed — select and copy manually."));
            }}
            aria-label="Copy command to clipboard"
        >
            Copy
        </Button>
    </div>

    <p class="mx-auto mt-6 max-w-xl text-sm text-muted-foreground">
        Don't get frustrated if you get stuck — there are lots of challenges to try.<br />
        Ask for hints, search around, or try ChatGPT — we're all learning!
    </p>
</main>
