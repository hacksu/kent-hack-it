<script lang="ts">
    import { browser } from '$app/environment';

	import favicon from '$lib/assets/favicon.ico';
	import logo from '$lib/assets/2026_KHI_Logo_Transparent.png';
    import apple_touch_icon from '$lib/assets/logo192.png';

    import 'bootstrap/dist/css/bootstrap.min.css';

    // only apply the boostrap js in the browser
    if (browser) {
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    <link rel="stylesheet" href="/css/index.css">
    <link rel="apple-touch-icon" href={apple_touch_icon} />

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Kent Hack It - A HacKSU sponsored Capture The Flag competition" />

    <title>Kent Hack It</title>
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center" href="/">
            <img
                src={logo}
                alt="KHI Logo"
                class="logo"
                height="80"
            />
        </a>

        <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/compete">Compete</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/leaderboard">Leaderboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/tools" target="_blank" rel="noopener noreferrer">Tools</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/discord" target="_blank" rel="noopener noreferrer">Community</a>
                </li>

                <li class="nav-item">
                    <a class="nav-link" href="/login">Login</a>
                </li>
            </ul>
        </div>
    </div>
</nav>

{@render children()}

<footer>&copy HacKSU 2026</footer>