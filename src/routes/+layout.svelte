<script lang="ts">
    import 'bootstrap/dist/css/bootstrap.min.css';
    import '../app.css';

    import { authClient } from "$lib/client";
    import { goto } from "$app/navigation"
    import { page } from "$app/state";

    import { ModeWatcher } from 'mode-watcher';
    import ThemeToggle from '$lib/components/theme-toggle.svelte';
    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import Menu from '@lucide/svelte/icons/menu';
    import X from '@lucide/svelte/icons/x';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import LogOut from '@lucide/svelte/icons/log-out';
    import Home from '@lucide/svelte/icons/home';
    import Shield from '@lucide/svelte/icons/shield';
    import Users from '@lucide/svelte/icons/users';
    import Dumbbell from '@lucide/svelte/icons/dumbbell';
    import Flag from '@lucide/svelte/icons/flag';
    import Trophy from '@lucide/svelte/icons/trophy';
    import Wrench from '@lucide/svelte/icons/wrench';
    import MessageSquare from '@lucide/svelte/icons/message-square';
    import LogIn from '@lucide/svelte/icons/log-in';

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

    type NavLink = { href: string; label: string; icon: typeof Home; external?: boolean };

    const navLinks = $derived.by((): NavLink[] => {
        const role = $session.data?.user.role;
        const links: NavLink[] = [{ href: "/", label: "Home", icon: Home }];
        if (role === "admin") links.push({ href: "/admin", label: "Admin", icon: Shield });
        else if (role === "user") links.push({ href: "/team", label: "Team", icon: Users });
        links.push(
            { href: "/gym", label: "Gym", icon: Dumbbell },
            { href: "/compete", label: "Compete", icon: Flag },
            { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
            { href: "/tools", label: "Tools", icon: Wrench, external: true },
            { href: "/discord", label: "Community", icon: MessageSquare, external: true }
        );
        return links;
    });

    function isActive(href: string): boolean {
        const path = page.url.pathname;
        return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
    }

    // Link styling. `!` modifiers defeat the legacy global `a { color: ... !important }`
    // and `a:hover { text-decoration: underline !important }` rules from static/css/index.css.
    const linkBase =
        "group/nav relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium no-underline! transition-colors";
    const linkIdle =
        "text-muted-foreground! hover:bg-sidebar-accent/70 hover:text-foreground! hover:no-underline!";
    const linkActive =
        "bg-gradient-to-r from-brand-green/15 to-brand-blue/10 text-foreground! hover:no-underline! before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-brand-green before:to-brand-blue";

	let { data, children } = $props();
</script>

{#snippet sidebar()}
    <!-- Brand header -->
    <div class="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <img src={logo} alt="KHI Logo" class="logo h-9 w-auto" />
        <div class="leading-tight">
            <p class="font-mono text-sm font-bold tracking-tight text-foreground">KENT HACK IT</p>
            <p class="font-mono text-[0.65rem] tracking-widest text-brand-blue uppercase">hacksu ctf</p>
        </div>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p class="px-3 pb-2 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
            // navigate
        </p>
        {#each navLinks as link (link.href)}
            {@const Icon = link.icon}
            {@const active = isActive(link.href)}
            <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                aria-current={active ? "page" : undefined}
                class="{linkBase} {active ? linkActive : linkIdle}"
                onclick={() => (mobileMenuOpen = false)}
            >
                <Icon class="h-4 w-4 shrink-0 {active ? 'text-brand-green' : ''}" />
                <span>{link.label}</span>
            </a>
        {/each}
    </nav>

    <!-- Footer: profile block pinned to the bottom (mirrors the reference) -->
    <div class="mt-auto border-t border-sidebar-border px-3 py-3">
        {#if $session.data?.user}
            {@const user = $session.data.user}
            <div class="flex items-center gap-3 rounded-lg px-2 py-2">
                <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-blue font-mono text-sm font-bold text-[#08131f] select-none"
                    aria-hidden="true"
                >
                    {(user.name ?? "?").trim().charAt(0).toUpperCase()}
                </div>
                <div class="min-w-0 flex-1 leading-tight">
                    <p class="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p class="font-mono text-[0.6rem] tracking-widest text-brand-blue uppercase">
                        {(user as { role?: string }).role ?? "member"}
                    </p>
                </div>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="ghost"
                                size="icon"
                                aria-label="Account menu"
                                class="shrink-0 text-muted-foreground! hover:text-foreground!"
                            >
                                <ChevronDown class="h-4 w-4 transition-transform group-aria-expanded/button:rotate-180" />
                            </Button>
                        {/snippet}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" side="top" class="w-[12rem]">
                        <DropdownMenu.Item onclick={handleLogout}>
                            <LogOut class="h-4 w-4" />
                            Logout
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
            </div>
        {:else}
            <a
                href="/auth/login"
                class="{linkBase} justify-center bg-gradient-to-r from-brand-green to-brand-blue font-semibold text-[#08131f]! shadow-glow hover:no-underline! hover:brightness-105"
                onclick={() => (mobileMenuOpen = false)}
            >
                <LogIn class="h-4 w-4" />
                <span>Login</span>
            </a>
        {/if}

        <!-- Controls + version line at the very bottom -->
        <div class="mt-2 flex items-center justify-between border-t border-sidebar-border/70 px-1 pt-2">
            <span class="font-mono text-[0.6rem] tracking-widest text-muted-foreground uppercase">v2026.10</span>
            <ThemeToggle />
        </div>
    </div>
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

<ModeWatcher defaultMode="dark" />

<!-- Mobile top bar -->
<div class="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur md:hidden">
    <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        aria-expanded={mobileMenuOpen}
        onclick={() => (mobileMenuOpen = true)}
    >
        <Menu class="h-5 w-5" />
    </Button>
    <a href="/" class="flex items-center gap-2 no-underline!">
        <img src={logo} alt="KHI Logo" class="logo h-7 w-auto" />
        <span class="font-mono text-sm font-bold tracking-tight text-foreground!">KENT HACK IT</span>
    </a>
</div>

<!-- Desktop fixed sidebar -->
<aside class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
    {@render sidebar()}
</aside>

<!-- Mobile off-canvas drawer -->
{#if mobileMenuOpen}
    <button
        type="button"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        aria-label="Close menu"
        onclick={() => (mobileMenuOpen = false)}
    ></button>
    <aside class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-glow md:hidden">
        <button
            type="button"
            class="absolute top-4 right-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Close menu"
            onclick={() => (mobileMenuOpen = false)}
        >
            <X class="h-5 w-5" />
        </button>
        {@render sidebar()}
    </aside>
{/if}

<!-- Main content -->
<div
    class="flex min-h-screen flex-col bg-background bg-[radial-gradient(120%_80%_at_50%_-10%,color-mix(in_oklch,var(--brand-blue)_9%,transparent),transparent_55%)] md:pl-60"
>
    {#if data.error}
        <div
            class="mx-4 mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-sm text-destructive"
        >
            {data.error}
        </div>
    {/if}

    <div class="flex-1">
        {@render children()}
    </div>

    <footer class="border-t border-border/60 bg-background px-4 py-6 text-center font-mono text-sm text-muted-foreground">
        &copy; HacKSU 2026
    </footer>
</div>
