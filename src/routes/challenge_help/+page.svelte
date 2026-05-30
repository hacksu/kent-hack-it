<div class="container text-center">
    <h1 class="display-5 fw-bold mb-3">Confused with a Challenge?</h1>

    <p class="lead mx-auto mb-3" style="maxWidth: 900px">
    Some challenges offer remote endpoints such as{" "}
    <strong>rev.ctf.hacksu.com:2530</strong>.<br />
    To interact with this endpoint, use <em>netcat</em> (nc) from your <a href="/kali-setup-guide" class="link-primary">Kali Linux</a> or other Unix shell.
    </p>

    <div class="d-flex justify-content-center align-items-start gap-2 mb-3">
    <div class="cli-box">
        <div class="cli-prompt">$</div>
        <code
        class="cli-command"
        id="nc-command"
        aria-label="Unix command: nc rev.ctf.hacksu.com 2530"
        >
        nc rev.ctf.hacksu.com 2530
        </code>
    </div>

    <button
        class="btn btn-secondary btn-sm"
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
    </button>
    </div>

    <p class="text-muted" style="maxWidth: 900px; margin: 0 auto; color: #494949ff;">
    Don't get frustrated if you get stuck — there are lots of challenges to try.<br />
    Ask for hints, search around, or try ChatGPT — we're all learning!
    </p>
</div>