<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import PageHeader from "$lib/components/page-header.svelte";
    import Panel from "$lib/components/panel.svelte";
    import Callout from "$lib/components/callout.svelte";
    import GuideStep from "$lib/components/guide-step.svelte";
    import Download from "@lucide/svelte/icons/download";
    import ExternalLink from "@lucide/svelte/icons/external-link";
    import Lightbulb from "@lucide/svelte/icons/lightbulb";

    const requirements = [
        { label: "RAM", value: "At least 4GB (8GB+ recommended)" },
        { label: "Storage", value: "25GB+ free disk space" },
        { label: "CPU", value: "64-bit processor with virtualization support" },
        { label: "OS", value: "Windows, macOS, or Linux host system" },
    ];

    const listClass = "list-decimal space-y-2 pl-5 marker:font-mono marker:text-muted-foreground";
    const strongClass = "font-medium text-foreground";
</script>

<main class="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8">
    <PageHeader
        eyebrow="Guide"
        title="Kali Linux VM setup guide"
        description="Get ready for CTF competitions with a complete Kali Linux virtual machine setup"
    />

    <Panel title="Prerequisites" class="mb-10">
        <dl class="grid grid-cols-1 gap-x-6 gap-y-4 p-4 text-sm sm:grid-cols-2">
            {#each requirements as req}
                <div>
                    <dt class="eyebrow">{req.label}</dt>
                    <dd class="mt-1 text-foreground">{req.value}</dd>
                </div>
            {/each}
        </dl>
    </Panel>

    <ol class="list-none">
        <GuideStep number={1} title="Choose and install virtualization software">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="flex flex-col items-start rounded-lg border border-border bg-background/50 p-4">
                    <h3 class="text-sm font-semibold text-foreground">VirtualBox (Free)</h3>
                    <p class="mt-1 mb-3">Best for beginners and casual use</p>
                    <Button
                        href="https://www.virtualbox.org/wiki/Downloads"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        size="sm"
                        class="mt-auto"
                    >
                        Download VirtualBox
                        <ExternalLink />
                    </Button>
                </div>
                <div class="flex flex-col items-start rounded-lg border border-border bg-background/50 p-4">
                    <h3 class="text-sm font-semibold text-foreground">VMware (Paid/Free Student)</h3>
                    <p class="mt-1 mb-3">Better performance, more features</p>
                    <Button
                        href="https://www.vmware.com/products/workstation-player.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        size="sm"
                        class="mt-auto"
                    >
                        Download VMware
                        <ExternalLink />
                    </Button>
                </div>
            </div>
            <Callout tone="warning">
                <p>
                    <strong>Note:</strong> Enable virtualization in your BIOS/UEFI if you encounter issues. Look for
                    "Intel VT-x" or "AMD-V" settings.
                </p>
            </Callout>
        </GuideStep>

        <GuideStep number={2} title="Download Kali Linux">
            <p>Download the official Kali Linux ISO from the official website:</p>
            <Button
                href="https://www.kali.org/get-kali/"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
            >
                <Download />Download Kali Linux ISO
            </Button>
            <Callout tone="info" title="Pro tips" icon={Lightbulb}>
                <ul class="list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Choose the <strong class={strongClass}>"Installer"</strong> version for virtual machines</li>
                    <li>Download size is approximately 3-4GB</li>
                    <li>Verify the SHA256 checksum for security</li>
                </ul>
            </Callout>
        </GuideStep>

        <GuideStep number={3} title="Create virtual machine">
            <h3 class="text-sm font-semibold text-foreground">VirtualBox instructions</h3>
            <ol class="{listClass}">
                <li>Open VirtualBox and click <strong class={strongClass}>"New"</strong></li>
                <li>
                    <strong class={strongClass}>Name:</strong> Kali Linux<br />
                    <strong class={strongClass}>Type:</strong> Linux<br />
                    <strong class={strongClass}>Version:</strong> Debian (64-bit)
                </li>
                <li><strong class={strongClass}>RAM:</strong> Allocate 4GB minimum, 8GB if available</li>
                <li><strong class={strongClass}>Hard Disk:</strong> Create a new virtual hard disk (VDI format)</li>
                <li><strong class={strongClass}>Storage:</strong> Dynamically allocated, 25GB minimum</li>
            </ol>
        </GuideStep>

        <GuideStep number={4} title="Install Kali Linux">
            <ol class={listClass}>
                <li>Mount the Kali ISO to your VM's virtual CD drive</li>
                <li>Start the VM and select <strong class={strongClass}>"Graphical Install"</strong></li>
                <li>Choose your language, location, and keyboard layout</li>
                <li>Set hostname: <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">kali</code></li>
                <li>Create a strong root password and user account</li>
                <li><strong class={strongClass}>Partitioning:</strong> Use entire disk (recommended for beginners)</li>
                <li><strong class={strongClass}>Software Selection:</strong> Choose "Desktop Environment" + "Default Tools"</li>
                <li>Install GRUB bootloader to the virtual hard disk</li>
            </ol>
            <Callout tone="success">
                <p>
                    <strong>Installation complete!</strong> The VM will reboot into your new Kali Linux system.
                </p>
            </Callout>
        </GuideStep>
    </ol>
</main>
