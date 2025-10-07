import { useState, useEffect } from 'react';
import '../App.css';
import Navbar, { VerifyAuth } from '../components/navbar.js';

export function ChallengeHelp() {
    const [isAuth, SetAuth] = useState(false);
    useEffect(() => {
        async function Verify() {
            const authenticated = await VerifyAuth();
            SetAuth(authenticated);
            if (authenticated === false) {
                window.location.href = "/login";
            }
        }
        Verify();
    }, []); // runs on-load

    return (
        <>
        {isAuth === true ? (
            <>
            <div className="App">
                <Navbar />
                <header className="App-header d-flex flex-column" style={{ minHeight: '100vh', padding: '1rem 0px' }}>
                <div className="container text-center">
                    <h1 className="display-5 fw-bold mb-3">Confused with a Challenge?</h1>

                    <p className="lead mx-auto mb-3" style={{ maxWidth: 900 }}>
                    Some challenges offer remote endpoints such as{" "}
                    <strong>rev.ctf.hacksu.com:2530</strong>.<br />
                    To interact with this endpoint, use <em>netcat</em> (nc) from your <a href="/kali-setup-guide" className="link-primary">Kali Linux</a> or other Unix shell.
                    </p>

                    {/* CLI command block */}
                    <div className="d-flex justify-content-center align-items-start gap-2 mb-3">
                    <div className="cli-box">
                        <div className="cli-prompt">$</div>
                        <code
                        className="cli-command"
                        id="nc-command"
                        aria-label="Unix command: nc rev.ctf.hacksu.com 2530"
                        >
                        nc rev.ctf.hacksu.com 2530
                        </code>
                    </div>

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
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

                    <p className="text" style={{ maxWidth: 900, margin: "0 auto", color:'#494949ff' }}>
                    Don't get frustrated if you get stuck — there are lots of challenges to try.<br />
                    Ask for hints, search around, or try ChatGPT — we're all learning!
                    </p>
                </div>
                </header>
            </div>
            </>
        ) : (
            <>
                <h1>Page Loading. . .</h1>
            </>
        )}
        </>
    );
}