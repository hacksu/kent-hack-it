<script lang="ts">
    import { authClient } from "$lib/client";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";

    const { data } = $props(); // fetch data returned from respective .server.ts file
</script>

<main class="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm">
        <div class="mb-5 flex items-center justify-center gap-2.5">
            <span class="h-3 w-0.5 rounded-full bg-gradient-to-b from-brand-green to-brand-blue"></span>
            <span class="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Authenticate
            </span>
        </div>

        <Card.Root class="border border-border bg-card">
            <Card.Header class="text-center">
                <Card.Title class="justify-center font-mono text-xl font-bold text-foreground">Login</Card.Title>
            </Card.Header>
            <Card.Content class="mt-2 flex flex-col gap-3">
                {#each data.providers as { name, provider, icon }}
                    <Button
                        type="button"
                        onclick={async () => await authClient.signIn.social({ provider })}
                        class="h-11 w-full justify-center gap-2.5 bg-gradient-to-r from-brand-green to-brand-blue text-sm font-semibold text-[#08131f]! no-underline! hover:no-underline! hover:brightness-105"
                    >
                        <img src={icon} alt={name} width="20" height="20" class="invert" />
                        Login with {name}
                    </Button>
                {/each}
            </Card.Content>
        </Card.Root>
    </div>
</main>
