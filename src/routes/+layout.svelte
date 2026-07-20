<script lang="ts">
    import 'bootstrap/dist/css/bootstrap.min.css';
    import '../app.css';

    import { authClient } from "$lib/client";
    import { goto } from "$app/navigation"

    import { ModeWatcher } from 'mode-watcher';
    import ThemeToggle from '$lib/components/theme-toggle.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import Menu from '@lucide/svelte/icons/menu';
    import X from '@lucide/svelte/icons/x';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';

    import favicon from '$lib/assets/favicon.ico';
	import logo from '$lib/assets/2026_KHI_Logo_Transparent.png';
    import apple_touch_icon from '$lib/assets/logo192.png';

    import { browser } from '$app/environment';
    // only apply the boostrap js in the browser
    if (browser) {
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }

    async function handleLogout() {
        await authClient.signOut();
        goto("/auth/login");
    }

    const session = authClient.useSession();

    let mobileMenuOpen = $state(false);

    const navLinkClass =
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground! no-underline! transition-colors hover:bg-muted hover:text-foreground! hover:no-underline!";

	let { data, children } = $props();
</script>

{#snippet navItems(mobile: boolean)}
    <a href="/" class={navLinkClass + (mobile ? " block w-full" : "")} onclick={() => (mobileMenuOpen = false)}>
        Home
    </a>

    {#if $session.data?.user.role === "admin"}
        <a href="/admin" class={navLinkClass + (mobile ? " block w-full" : "")} onclick={() => (mobileMenuOpen = false)}>
            Admin
        </a>
    {:else if $session.data?.user.role === "user" }
        <a href="/team" class={navLinkClass + (mobile ? " block w-full" : "")} onclick={() => (mobileMenuOpen = false)}>
            Team
        </a>
    {/if}

    <a href="/gym" class={navLinkClass + (mobile ? " block w-full" : "")} onclick={() => (mobileMenuOpen = false)}>
        Gym
    </a>
    <a href="/compete" class={navLinkClass + (mobile ? " block w-full" : "")} onclick={() => (mobileMenuOpen = false)}>
        Compete
    </a>
    <a href="/leaderboard" class={navLinkClass + (mobile ? " block w-full" : "")} onclick={() => (mobileMenuOpen = false)}>
        Leaderboard
    </a>
    <a
        href="/tools"
        target="_blank"
        rel="noopener noreferrer"
        class={navLinkClass + (mobile ? " block w-full" : "")}
        onclick={() => (mobileMenuOpen = false)}
    >
        Tools
    </a>
    <a
        href="/discord"
        target="_blank"
        rel="noopener noreferrer"
        class={navLinkClass + (mobile ? " block w-full" : "")}
        onclick={() => (mobileMenuOpen = false)}
    >
        Community
    </a>
{/snippet}

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

<ModeWatcher />

<nav class="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
    <div class="h-0.5 w-full bg-gradient-to-r from-[#61cf5a] to-[#4a9eff]"></div>

    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
        <a href="/" class="flex shrink-0 items-center">
            <img src={logo} alt="KHI Logo" class="logo h-10 w-auto" />
        </a>

        {#if data.error}
            <div
                class="order-last w-full rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-sm text-destructive md:order-none md:w-auto"
            >
                {data.error}
            </div>
        {/if}

        <div class="hidden items-center gap-1 md:flex">
            {@render navItems(false)}
        </div>

        <div class="flex shrink-0 items-center gap-1">
            <ThemeToggle />

            {#if $session.data?.user}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        {#snippet child({ props })}
                            <Button {...props} variant="ghost" class="gap-1.5">
                                {$session.data?.user.name}
                                <ChevronDown class="h-4 w-4 opacity-60 transition-transform data-[state=open]:rotate-180" />
                            </Button>
                        {/snippet}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                        <DropdownMenu.Item onclick={handleLogout}>Logout</DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            {:else}
                <a href="/auth/login" class={navLinkClass}>Login</a>
            {/if}

            <Button
                variant="ghost"
                size="icon"
                class="md:hidden"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
            >
                {#if mobileMenuOpen}
                    <X class="h-5 w-5" />
                {:else}
                    <Menu class="h-5 w-5" />
                {/if}
            </Button>
        </div>
    </div>

    {#if mobileMenuOpen}
        <div class="border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
            <div class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
                {@render navItems(true)}
            </div>
        </div>
    {/if}
</nav>

{@render children()}

<footer class="border-t border-border/60 bg-background px-4 py-6 text-center text-sm text-muted-foreground">
    &copy HacKSU 2026
</footer>
