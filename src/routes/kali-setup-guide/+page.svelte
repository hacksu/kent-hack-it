<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import * as Card from "$lib/components/ui/card";
    import Info from "@lucide/svelte/icons/info";
    import Download from "@lucide/svelte/icons/download";
    import Lightbulb from "@lucide/svelte/icons/lightbulb";
    import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
    import CircleCheckBig from "@lucide/svelte/icons/circle-check-big";

    const infoBoxClass = "rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-4";
    const warningBoxClass = "rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-foreground";
    const successBoxClass = "rounded-lg border border-brand-green/30 bg-brand-green/10 p-4 text-sm text-foreground";
    const stepTitleClass = "flex items-center gap-2.5 font-mono text-xl font-bold text-foreground sm:text-2xl";
</script>

<main class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-14">
    <div class="mb-8 text-center sm:mb-10">
        <h1 class="font-mono text-3xl font-bold text-foreground sm:text-4xl">Kali Linux VM Setup Guide</h1>
        <p class="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Get ready for CTF competitions with a complete Kali Linux virtual machine setup
        </p>
    </div>

    <div class="space-y-5">
        <!-- Prerequisites -->
        <Card.Root class="border border-border bg-card p-5 sm:p-6">
            <Card.Content class="p-0">
                <h3 class="mb-4 font-mono text-xl font-bold text-foreground sm:text-2xl">Prerequisites</h3>
                <div class={infoBoxClass}>
                    <h6 class="mb-2 flex items-center gap-2 font-medium text-brand-blue">
                        <Info class="h-4.5 w-4.5" />System Requirements
                    </h6>
                    <ul class="mb-0 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li><strong class="text-foreground">RAM:</strong> At least 4GB (8GB+ recommended)</li>
                        <li><strong class="text-foreground">Storage:</strong> 25GB+ free disk space</li>
                        <li><strong class="text-foreground">CPU:</strong> 64-bit processor with virtualization support</li>
                        <li><strong class="text-foreground">OS:</strong> Windows, macOS, or Linux host system</li>
                    </ul>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Step 1 -->
        <Card.Root class="border border-border bg-card p-5 sm:p-6">
            <Card.Content class="p-0">
                <h3 class={stepTitleClass + " mb-4"}>
                    <Badge class="bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]!">1</Badge>
                    Choose and Install Virtualization Software
                </h3>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div class="rounded-lg border border-border p-3">
                        <h5 class="font-medium text-brand-green">VirtualBox (Free)</h5>
                        <p class="mb-2 text-sm text-muted-foreground">Best for beginners and casual use</p>
                        <Button
                            href="https://www.virtualbox.org/wiki/Downloads"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            size="sm"
                            class="border-brand-green/40 text-brand-green! hover:bg-brand-green/10"
                        >
                            Download VirtualBox
                        </Button>
                    </div>
                    <div class="rounded-lg border border-border p-3">
                        <h5 class="font-medium text-brand-blue">VMware (Paid/Free Student)</h5>
                        <p class="mb-2 text-sm text-muted-foreground">Better performance, more features</p>
                        <Button
                            href="https://www.vmware.com/products/workstation-player.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            size="sm"
                            class="border-brand-blue/40 text-brand-blue! hover:bg-brand-blue/10"
                        >
                            Download VMware
                        </Button>
                    </div>
                </div>
                <div class="{warningBoxClass} mt-4 flex items-start gap-2.5">
                    <TriangleAlert class="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-400" />
                    <p class="mb-0">
                        <strong>Note:</strong> Enable virtualization in your BIOS/UEFI if you encounter issues. Look for
                        "Intel VT-x" or "AMD-V" settings.
                    </p>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Step 2 -->
        <Card.Root class="border border-border bg-card p-5 sm:p-6">
            <Card.Content class="p-0">
                <h3 class={stepTitleClass + " mb-4"}>
                    <Badge class="bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]!">2</Badge>
                    Download Kali Linux
                </h3>
                <p class="text-sm text-muted-foreground">Download the official Kali Linux ISO from the official website:</p>
                <div class="my-4 text-center">
                    <Button
                        href="https://www.kali.org/get-kali/"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="lg"
                        class="gap-2 bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]! shadow-glow hover:brightness-110"
                    >
                        <Download class="h-4.5 w-4.5" />Download Kali Linux ISO
                    </Button>
                </div>
                <div class={infoBoxClass}>
                    <h6 class="mb-2 flex items-center gap-2 font-medium text-brand-blue">
                        <Lightbulb class="h-4.5 w-4.5" />Pro Tips:
                    </h6>
                    <ul class="mb-0 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>Choose the <strong class="text-foreground">"Installer"</strong> version for virtual machines</li>
                        <li>Download size is approximately 3-4GB</li>
                        <li>Verify the SHA256 checksum for security</li>
                    </ul>
                </div>
            </Card.Content>
        </Card.Root>

        <!-- Step 3 -->
        <Card.Root class="border border-border bg-card p-5 sm:p-6">
            <Card.Content class="p-0">
                <h3 class={stepTitleClass + " mb-4"}>
                    <Badge class="bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]!">3</Badge>
                    Create Virtual Machine
                </h3>
                <h5 class="mb-3 font-medium text-foreground">VirtualBox Instructions:</h5>
                <ol class="list-decimal space-y-2 pl-5 text-sm text-muted-foreground marker:font-mono marker:text-brand-blue">
                    <li>Open VirtualBox and click <strong class="text-foreground">"New"</strong></li>
                    <li>
                        <strong class="text-foreground">Name:</strong> Kali Linux<br />
                        <strong class="text-foreground">Type:</strong> Linux<br />
                        <strong class="text-foreground">Version:</strong> Debian (64-bit)
                    </li>
                    <li><strong class="text-foreground">RAM:</strong> Allocate 4GB minimum, 8GB if available</li>
                    <li><strong class="text-foreground">Hard Disk:</strong> Create a new virtual hard disk (VDI format)</li>
                    <li><strong class="text-foreground">Storage:</strong> Dynamically allocated, 25GB minimum</li>
                </ol>
            </Card.Content>
        </Card.Root>

        <!-- Step 4 -->
        <Card.Root class="border border-border bg-card p-5 sm:p-6">
            <Card.Content class="p-0">
                <h3 class={stepTitleClass + " mb-4"}>
                    <Badge class="bg-gradient-to-r from-brand-green to-brand-blue text-[#08131f]!">4</Badge>
                    Install Kali Linux
                </h3>
                <ol class="list-decimal space-y-2 pl-5 text-sm text-muted-foreground marker:font-mono marker:text-brand-blue">
                    <li>Mount the Kali ISO to your VM's virtual CD drive</li>
                    <li>Start the VM and select <strong class="text-foreground">"Graphical Install"</strong></li>
                    <li>Choose your language, location, and keyboard layout</li>
                    <li>Set hostname: <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">kali</code></li>
                    <li>Create a strong root password and user account</li>
                    <li><strong class="text-foreground">Partitioning:</strong> Use entire disk (recommended for beginners)</li>
                    <li><strong class="text-foreground">Software Selection:</strong> Choose "Desktop Environment" + "Default Tools"</li>
                    <li>Install GRUB bootloader to the virtual hard disk</li>
                </ol>
                <div class="{successBoxClass} mt-4 flex items-start gap-2.5">
                    <CircleCheckBig class="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-green" />
                    <p class="mb-0">
                        <strong>Installation complete!</strong> The VM will reboot into your new Kali Linux system.
                    </p>
                </div>
            </Card.Content>
        </Card.Root>
    </div>
</main>
