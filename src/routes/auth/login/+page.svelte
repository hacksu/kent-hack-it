<script lang="ts">
    import { authClient } from "$lib/client";
    import { Button } from "$lib/components/ui/button";
    import logo from '$lib/assets/2026_KHI_Logo_Transparent.png';

    const { data } = $props(); // fetch data returned from respective .server.ts file
</script>

<main class="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
        <div class="mb-6 flex flex-col items-center text-center">
            <img src={logo} alt="" class="pointer-events-none size-20 object-contain" />
            <h1 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">Log in to Kent Hack It</h1>
            <p class="mt-1.5 text-sm text-muted-foreground">
                New here? Signing in with any provider creates your account.
            </p>
        </div>

        <div class="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
            {#each data.providers as { name, provider, icon }}
                <Button
                    type="button"
                    variant="outline"
                    onclick={async () => await authClient.signIn.social({ provider })}
                    class="h-11 w-full justify-center gap-2.5 text-sm"
                >
                    <img src={icon} alt="" width="18" height="18" class="dark:invert" />
                    Continue with {name === "Github" ? "GitHub" : name}
                </Button>
            {/each}
        </div>

        <p class="mt-4 text-center text-xs text-muted-foreground">
            Having trouble? Ask in our <a href="/discord" class="link">Discord</a>.
        </p>
    </div>
</main>
