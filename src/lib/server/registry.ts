import { env } from "$env/dynamic/private";

export interface RegistryImages {
    ssh: string[];
    web: string[];
}

const EMPTY: RegistryImages = { ssh: [], web: [] };

/**
 * Lists every `repo:tag` currently pushed to the configured registry,
 * split by the khi-ssh/ and khi-web/ prefixes admins pick images from.
 * Returns empty lists (never throws) if the registry is unset or unreachable,
 * so the admin form can fall back to free-text entry.
 */
export async function ListRegistryImages(): Promise<RegistryImages> {
    const registry = process.env.SSH_IMAGE_REGISTRY ?? env.SSH_IMAGE_REGISTRY;
    if (!registry) return EMPTY;

    const user = process.env.SSH_REGISTRY_USER ?? env.SSH_REGISTRY_USER;
    const password = process.env.SSH_REGISTRY_PASSWORD ?? env.SSH_REGISTRY_PASSWORD;
    const headers: Record<string, string> = (user && password)
        ? { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}` }
        : {};

    try {
        const catalogRes = await fetch(`https://${registry}/v2/_catalog`, { headers });
        if (!catalogRes.ok) {
            console.error(`[-] Registry catalog fetch failed: ${catalogRes.status}`);
            return EMPTY;
        }

        const { repositories } = await catalogRes.json() as { repositories: string[] };
        const images: RegistryImages = { ssh: [], web: [] };

        await Promise.all(repositories.map(async (repo) => {
            const isSsh = repo.startsWith('khi-ssh/');
            const isWeb = repo.startsWith('khi-web/');
            if (!isSsh && !isWeb) return;

            try {
                const tagsRes = await fetch(`https://${registry}/v2/${repo}/tags/list`, { headers });
                if (!tagsRes.ok) return;

                const { tags } = await tagsRes.json() as { tags: string[] | null };
                for (const tag of tags ?? []) {
                    (isSsh ? images.ssh : images.web).push(`${repo}:${tag}`);
                }
            } catch (e) {
                console.error(`[-] Failed to list tags for ${repo}:`, e);
            }
        }));

        images.ssh.sort();
        images.web.sort();
        return images;
    } catch (e) {
        console.error('[-] Failed to list registry images:', e);
        return EMPTY;
    }
}
