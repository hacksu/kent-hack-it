<script lang="ts">
    import { Combobox } from 'bits-ui';
    import Check from '@lucide/svelte/icons/check';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import ChevronUp from '@lucide/svelte/icons/chevron-up';
    import { fuzzySearch } from '$lib/fuzzy-search';

    let { id, name, label, options, value = $bindable('') }: {
        id: string;
        name: string;
        label: string;
        options: string[];
        value: string;
    } = $props();

    const NONE = '__no_registry_image__';
    let open = $state(false);
    let query = $state('');
    let matches = $derived(fuzzySearch(options, query));
    let items = $derived.by(() => {
        const none = { value: NONE, label: 'None' };
        const images = matches.map(image => ({ value: image, label: image }));
        return query.trim() ? [...images, none] : [none, ...images];
    });
</script>

<input type="hidden" {name} {value} autocomplete="off" />
<Combobox.Root
    type="single"
    bind:open
    bind:value={() => value || NONE, selected => { value = selected === NONE ? '' : selected; }}
    inputValue={open ? query : value || 'None'}
    allowDeselect={false}
    onOpenChange={() => { query = ''; }}
>
    <div class="relative">
        <Combobox.Input
            {id}
            aria-label={label}
            autocomplete="off"
            spellcheck={false}
            placeholder="Search images…"
            class="bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full min-w-0 rounded-lg border py-1 pr-9 pl-2.5 text-sm outline-none focus-visible:ring-3 placeholder:text-muted-foreground"
            onclick={() => { if (!open) { query = ''; open = true; } }}
            oninput={event => { query = event.currentTarget.value; open = true; }}
        />
        <Combobox.Trigger aria-label={`Open ${label.toLowerCase()} choices`} class="absolute inset-y-0 right-0 flex w-8 items-center justify-center rounded-r-lg text-muted-foreground">
            <ChevronDown class="size-4" />
        </Combobox.Trigger>
    </div>
    <Combobox.Portal>
        <Combobox.Content class="bg-popover text-popover-foreground z-50 flex max-h-[min(20rem,var(--bits-combobox-content-available-height,20rem))] w-(--bits-combobox-anchor-width) flex-col overflow-hidden rounded-lg shadow-md ring-1 ring-foreground/10" sideOffset={4} preventScroll>
            <Combobox.ScrollUpButton class="flex shrink-0 items-center justify-center py-1"><ChevronUp class="size-4" /></Combobox.ScrollUpButton>
            <Combobox.Viewport class="min-h-0 overscroll-contain p-1">
                {#each items as item (item.value)}
                    <Combobox.Item value={item.value} label={item.label} class="relative flex cursor-default items-center rounded-md py-1 pr-7 pl-1.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground">
                        {#snippet children({ selected })}
                            <span class="truncate">{item.label}</span>
                            {#if selected}<Check class="absolute right-2 size-3.5" />{/if}
                        {/snippet}
                    </Combobox.Item>
                {/each}
                {#if matches.length === 0 && query.trim()}
                    <p role="status" class="px-2 py-3 text-sm text-muted-foreground">No matching images.</p>
                {/if}
            </Combobox.Viewport>
            <Combobox.ScrollDownButton class="flex shrink-0 items-center justify-center py-1"><ChevronDown class="size-4" /></Combobox.ScrollDownButton>
        </Combobox.Content>
    </Combobox.Portal>
</Combobox.Root>
