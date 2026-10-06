<script lang="ts">
    import '../app.css';

    import { authClient } from "$lib/client";
    import { goto } from "$app/navigation"
    import { page } from "$app/state";

    import { Button } from '$lib/components/ui/button';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
    import UserAvatar from '$lib/components/user-avatar.svelte';
    import Menu from '@lucide/svelte/icons/menu';
    import X from '@lucide/svelte/icons/x';
    import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
    import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
    import LogOut from '@lucide/svelte/icons/log-out';
    import Home from '@lucide/svelte/icons/home';
    import Shield from '@lucide/svelte/icons/shield';
    import Users from '@lucide/svelte/icons/users';
    import Dumbbell from '@lucide/svelte/icons/dumbbell';
    import Flag from '@lucide/svelte/icons/flag';
    import Trophy from '@lucide/svelte/icons/trophy';
    import Wrench from '@lucide/svelte/icons/wrench';
    import MessageSquare from '@lucide/svelte/icons/message-square';
    import LifeBuoy from '@lucide/svelte/icons/life-buoy';
    import LogIn from '@lucide/svelte/icons/log-in';

    import favicon from '$lib/assets/favicon.ico';
	import logo from '$lib/assets/2026_KHI_Logo_Transparent.png';
    import apple_touch_icon from '$lib/assets/logo192.png';

    let { data, children } = $props();

    async function handleLogout() {
        await authClient.signOut();
        goto("/auth/login");
    }

    const session = authClient.useSession();

    // The client session store starts out pending; fall back to the server-loaded
    // user until it resolves so the sidebar doesn't flash the logged-out state.
    const currentUser = $derived($session.isPending ? data.user : ($session.data?.user ?? null));

    let mobileMenuOpen = $state(false);

    type NavLink = { href: string; label: string; icon: typeof Home; external?: boolean };
    type NavGroup = { label: string; links: NavLink[] };

    const navGroups = $derived.by((): NavGroup[] => {
        const role = currentUser?.role;
        const play: NavLink[] = [
            { href: "/", label: "Home", icon: Home },
            { href: "/compete", label: "Compete", icon: Flag },
            { href: "/gym", label: "Gym", icon: Dumbbell },
            { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
        ];
        if (role === "admin") play.push({ href: "/admin", label: "Admin", icon: Shield });
        else if (role === "user") play.push({ href: "/team", label: "Team", icon: Users });

        return [
            { label: "Play", links: play },
            {
                label: "Resources",
                links: [
                    { href: "/challenge_help", label: "Challenge help", icon: LifeBuoy },
                    { href: "/tools", label: "Tools", icon: Wrench, external: true },
                    { href: "/discord", label: "Community", icon: MessageSquare, external: true },
                ],
            },
        ];
    });

    function isActive(href: string): boolean {
        const path = page.url.pathname;
        return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
    }

    const linkBase =
        "group/nav relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";
    const linkIdle = "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground";
    const linkActive = "bg-sidebar-accent text-foreground";

</script>

{#snippet sidebar()}
    <!-- Brand header -->
    <a
        href="/"
        class="flex items-center gap-3 px-4 py-4 outline-none focus-visible:bg-sidebar-accent/60"
        onclick={() => (mobileMenuOpen = false)}
    >
        <img src={logo} alt="" class="pointer-events-none -my-2 -ml-1 size-14 shrink-0 object-contain" />
        <span class="min-w-0 leading-tight">
            <span class="block text-[0.9375rem] font-semibold tracking-tight whitespace-nowrap text-foreground">Kent Hack It</span>
            <span class="eyebrow block text-[0.625rem]">HacKSU CTF</span>
        </span>
    </a>

    <!-- Nav links -->
    <nav class="flex-1 space-y-5 overflow-y-auto px-3 py-2" aria-label="Main">
        {#each navGroups as group (group.label)}
            <div class="space-y-0.5">
                <p class="eyebrow px-3 pb-1.5 text-[0.625rem] text-muted-foreground/70">{group.label}</p>
                {#each group.links as link (link.href)}
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
                        {#if active}
                            <span class="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-green" aria-hidden="true"></span>
                        {/if}
                        <Icon class="size-4 shrink-0 {active ? 'text-brand-green' : ''}" />
                        <span class="flex-1">{link.label}</span>
                        {#if link.external}
                            <ArrowUpRight
                                class="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/nav:opacity-60 group-focus-visible/nav:opacity-60"
                                aria-label="opens in a new tab"
                            />
                        {/if}
                    </a>
                {/each}
            </div>
        {/each}
    </nav>

    <!-- Footer: account -->
    <div class="border-t border-sidebar-border p-2">
        {#if currentUser}
            {@const user = currentUser}
            <DropdownMenu.Root>
                <DropdownMenu.Trigger
                    class="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-sidebar-ring aria-expanded:bg-sidebar-accent"
                >
                    <UserAvatar name={user.name} image={user.image} />
                    <span class="min-w-0 flex-1 leading-tight">
                        <span class="block truncate text-sm font-medium text-foreground">{user.name}</span>
                        <span class="block text-xs text-muted-foreground capitalize">
                            {(user as { role?: string }).role ?? "member"}
                        </span>
                    </span>
                    <ChevronsUpDown class="size-4 shrink-0 text-muted-foreground" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="start" side="top" sideOffset={6}>
                    <DropdownMenu.Item onclick={handleLogout}>
                        <LogOut />
                        Log out
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        {:else}
            <Button href="/auth/login" size="lg" class="w-full" onclick={() => (mobileMenuOpen = false)}>
                <LogIn />
                Log in
            </Button>
        {/if}
    </div>
{/snippet}

<svelte:head>
	<link rel="icon" href={favicon} />
    <link rel="apple-touch-icon" href={apple_touch_icon} />
    <link rel="preload" href="/fonts/geist-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin="anonymous" />

    <meta name="theme-color" content="#0f1420" />
    <meta name="description" content="Kent Hack It - A HacKSU sponsored Capture The Flag competition" />

    <title>Kent Hack It</title>
</svelte:head>

<svelte:window onkeydown={(e) => { if (e.key === "Escape") mobileMenuOpen = false; }} />

<!-- Mobile top bar -->
<div class="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur md:hidden">
    <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Open menu"
        aria-expanded={mobileMenuOpen}
        onclick={() => (mobileMenuOpen = true)}
    >
        <Menu class="size-5" />
    </Button>
    <a href="/" class="flex items-center gap-2">
        <img src={logo} alt="" class="pointer-events-none size-10 object-contain" />
        <span class="text-sm font-semibold tracking-tight text-foreground">Kent Hack It</span>
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
        class="fixed inset-0 z-40 animate-overlay-in bg-black/60 backdrop-blur-sm md:hidden"
        aria-label="Close menu"
        onclick={() => (mobileMenuOpen = false)}
    ></button>
    <aside class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-2xl md:hidden">
        <button
            type="button"
            class="absolute top-4 right-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Close menu"
            onclick={() => (mobileMenuOpen = false)}
        >
            <X class="size-5" />
        </button>
        {@render sidebar()}
    </aside>
{/if}

<!-- Main content -->
<div class="app-bg flex min-h-screen flex-col md:pl-60">
    {#if data.error}
        <div
            role="alert"
            class="mx-4 mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:mx-6"
        >
            {data.error}
        </div>
    {/if}

    <div class="flex-1">
        {@render children()}
    </div>

    <footer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-border px-4 py-5 text-xs text-muted-foreground sm:px-6">
        <span>&copy; HacKSU {new Date().getFullYear()}</span>
        <span class="flex items-center gap-4">
            <a href="https://hacksu.com/" class="transition-colors hover:text-foreground">hacksu.com</a>
            <a href="/kali-setup-guide" class="transition-colors hover:text-foreground">Kali setup guide</a>
        </span>
    </footer>
</div>
