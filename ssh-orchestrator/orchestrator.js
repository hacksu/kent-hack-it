const DOCKER_PROXY_HOST = process.env.DOCKER_PROXY_HOST ?? 'docker-socket-proxy';
const DOCKER_PROXY_PORT = process.env.DOCKER_PROXY_PORT ?? '2375';
const DOCKER_API = `http://${DOCKER_PROXY_HOST}:${DOCKER_PROXY_PORT}`;

const KHI_TYPE_LABEL = 'khi.type';
const KHI_SSH_TYPE_VALUE = 'ssh-instance';
const KHI_WEB_TYPE_VALUE = 'web-instance';

const SSH_MIN_PORT = Number(process.env.SSH_MIN_PORT);
const SSH_MAX_PORT = Number(process.env.SSH_MAX_PORT);
const WEB_MIN_PORT = Number(process.env.WEB_MIN_PORT);
const WEB_MAX_PORT = Number(process.env.WEB_MAX_PORT);

const SSH_INSTANCE_CPU_NANOS = Number(process.env.SSH_INSTANCE_CPU_NANOS ?? 1000000000);
const SSH_INSTANCE_MEM_BYTES = Number(process.env.SSH_INSTANCE_MEM_BYTES ?? 268435456);
const SSH_INSTANCE_PIDS_LIMIT = Number(process.env.SSH_INSTANCE_PIDS_LIMIT ?? 128);
const SSH_INSTANCE_MINUTES = Number(process.env.SSH_INSTANCE_MINUTES ?? 45);

const WEB_INSTANCE_CPU_NANOS = Number(process.env.WEB_INSTANCE_CPU_NANOS ?? 1000000000);
const WEB_INSTANCE_MEM_BYTES = Number(process.env.WEB_INSTANCE_MEM_BYTES ?? 268435456);
const WEB_INSTANCE_PIDS_LIMIT = Number(process.env.WEB_INSTANCE_PIDS_LIMIT ?? 128);

const KHI_UID_LABEL = 'khi.uid';
const KHI_CHALLENGE_LABEL = 'khi.challenge_id';
const KHI_EXPIRES_LABEL = 'khi.expires_at';
const KHI_NETWORK_LABEL = 'khi.network';
const KHI_NET_LABEL = 'khi.net';
const KHI_NET_VALUE = 'instance';

const SSH_IMAGE_REGISTRY = process.env.SSH_IMAGE_REGISTRY;
const SSH_REGISTRY_USER = process.env.SSH_REGISTRY_USER;
const SSH_REGISTRY_PASSWORD = process.env.SSH_REGISTRY_PASSWORD;

const SSH_IMAGE_PREFIX = process.env.SSH_IMAGE_PREFIX ?? 'khi-ssh/';
const WEB_IMAGE_PREFIX = process.env.WEB_IMAGE_PREFIX ?? 'khi-web/';

function isAllowedImage(image_ref, prefix) {
    return typeof image_ref === 'string' && image_ref.startsWith(prefix);
}

async function listByType(typeValue) {
    const filters = encodeURIComponent(JSON.stringify({ label: [`${KHI_TYPE_LABEL}=${typeValue}`] }));
    const res = await fetch(`${DOCKER_API}/containers/json?all=false&filters=${filters}`);
    if (!res.ok) {
        throw new Error(`Docker API list failed: ${res.status}`);
    }
    return await res.json();
}

export async function ListInstances() {
    return listByType(KHI_SSH_TYPE_VALUE);
}

export async function ListWebInstances() {
    return listByType(KHI_WEB_TYPE_VALUE);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function anyHostPortOf(container) {
    const binding = (container.Ports || []).find(p => p.PublicPort);
    return binding ? binding.PublicPort : null;
}

async function getUnusedPort(containers, minPort, maxPort) {
    const usedPorts = new Set(containers.map(anyHostPortOf).filter(Boolean));

    const candidates = [];
    for (let port = minPort; port <= maxPort; port++) {
        candidates.push(port);
    }
    shuffle(candidates);

    for (const port of candidates) {
        if (!usedPorts.has(port)) return port;
    }
    return -1;
}

export async function GetUnusedSSHPort() {
    return getUnusedPort(await ListInstances(), SSH_MIN_PORT, SSH_MAX_PORT);
}

export async function GetUnusedWebPort() {
    return getUnusedPort(await ListWebInstances(), WEB_MIN_PORT, WEB_MAX_PORT);
}

function generatePassword() {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

const expiryTimers = new Map();

function armExpiryTimer(containerId, expiresAt) {
    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => {
        console.log(`[*] Expiry reached for ${containerId}, stopping...`);
        StopInstance(containerId);
    }, Math.max(remainingMs, 0));
    timer.unref();
    expiryTimers.set(containerId, timer);
}

async function resolveImage(image_ref) {
    if (!SSH_IMAGE_REGISTRY) {
        return image_ref;
    }

    const fullRef = `${SSH_IMAGE_REGISTRY}/${image_ref}`;
    const authHeader = Buffer.from(JSON.stringify({
        username: SSH_REGISTRY_USER,
        password: SSH_REGISTRY_PASSWORD,
        serveraddress: SSH_IMAGE_REGISTRY,
    })).toString('base64');

    const pullRes = await fetch(`${DOCKER_API}/images/create?fromImage=${encodeURIComponent(fullRef)}`, {
        method: 'POST',
        headers: { 'X-Registry-Auth': authHeader },
    });

    await pullRes.text();

    if (pullRes.ok) {
        return fullRef;
    }

    console.error(`[-] Registry pull failed for ${fullRef} (${pullRes.status}), falling back to local image ${image_ref}`);

    const localRes = await fetch(`${DOCKER_API}/images/${encodeURIComponent(image_ref)}/json`);
    if (!localRes.ok) {
        throw new Error(`Image pull failed (${pullRes.status}) and no local image "${image_ref}" found`);
    }

    return image_ref;
}

async function getResourceLimits(image) {
    const res = await fetch(`${DOCKER_API}/images/${encodeURIComponent(image)}/json`);
    if (!res.ok) {
        return { pidsLimit: WEB_INSTANCE_PIDS_LIMIT, memBytes: WEB_INSTANCE_MEM_BYTES };
    }
    const info = await res.json();
    const labels = info.Config?.Labels ?? {};
    const pidsLimit = labels['khi.pids_limit'] ? Number(labels['khi.pids_limit']) : WEB_INSTANCE_PIDS_LIMIT;
    const memBytes = labels['khi.mem_bytes'] ? Number(labels['khi.mem_bytes']) : WEB_INSTANCE_MEM_BYTES;
    return { pidsLimit, memBytes };
}

async function getExposedContainerPort(image) {
    const res = await fetch(`${DOCKER_API}/images/${encodeURIComponent(image)}/json`);
    if (!res.ok) {
        throw new Error(`Image inspect failed: ${res.status}`);
    }
    const info = await res.json();

    const labelPort = info.Config?.Labels?.['khi.port'];
    if (labelPort) {
        return `${labelPort}/tcp`;
    }

    const exposed = Object.keys(info.Config?.ExposedPorts ?? {});
    if (exposed.length === 0) {
        throw new Error('Image exposes no ports');
    }
    if (exposed.length > 1) {
        throw new Error(`Image exposes multiple ports (${exposed.join(', ')}) - web challenge images must expose exactly one, or set a khi.port label to disambiguate`);
    }
    return exposed[0];
}

async function createInstanceNetwork() {
    const name = `khi-inst-${crypto.randomUUID().replace(/-/g, '')}`;

    const createRes = await fetch(`${DOCKER_API}/networks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Name: name,
            Driver: 'bridge',
            Labels: { [KHI_NET_LABEL]: KHI_NET_VALUE },
        }),
    });

    if (!createRes.ok) {
        throw new Error(`Network create failed: ${createRes.status}`);
    }

    return name;
}

async function removeInstanceNetwork(networkName) {
    if (!networkName) return;
    try {
        await fetch(`${DOCKER_API}/networks/${networkName}`, { method: 'DELETE' });
    } catch (e) {
        console.error(`[-] failed to remove network ${networkName}:`, e);
    }
}

export async function CreateSSHInstance(uid, image_ref) {
    if (!uid || !image_ref) {
        return { success: false, rc: 400, error: 'Missing uid or image_ref' };
    }

    if (!isAllowedImage(image_ref, SSH_IMAGE_PREFIX)) {
        return { success: false, rc: 403, error: 'Image not allowed' };
    }

    const port = await GetUnusedSSHPort();
    if (port === -1) {
        return { success: false, rc: 500, error: 'No free SSH ports available' };
    }

    let resolvedImage;
    try {
        resolvedImage = await resolveImage(image_ref);
    } catch (e) {
        console.error("[-] image resolution failed:", e);
        return { success: false, rc: 500, error: 'Failed to pull image' };
    }

    let networkName;
    try {
        networkName = await createInstanceNetwork();
    } catch (e) {
        console.error("[-] network creation failed:", e);
        return { success: false, rc: 500, error: 'Failed to create network' };
    }

    const password = generatePassword();
    const expiresAt = new Date(Date.now() + SSH_INSTANCE_MINUTES * 60 * 1000);

    const createRes = await fetch(`${DOCKER_API}/containers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Image: resolvedImage,
            Env: [`CTF_PASSWORD=${password}`],
            Labels: {
                [KHI_TYPE_LABEL]: KHI_SSH_TYPE_VALUE,
                [KHI_UID_LABEL]: uid,
                [KHI_EXPIRES_LABEL]: expiresAt.toISOString(),
                [KHI_NETWORK_LABEL]: networkName,
            },
            ExposedPorts: { "22/tcp": {} },
            HostConfig: {
                PortBindings: { "22/tcp": [{ HostPort: String(port) }] },
                NetworkMode: networkName,
                AutoRemove: true,
                NanoCpus: SSH_INSTANCE_CPU_NANOS,
                Memory: SSH_INSTANCE_MEM_BYTES,
                PidsLimit: SSH_INSTANCE_PIDS_LIMIT,
            },
        }),
    });

    if (!createRes.ok) {
        console.error("[-] container create failed:", createRes.status, await createRes.text());
        await removeInstanceNetwork(networkName);
        return { success: false, rc: 500, error: 'Failed to create container' };
    }

    const { Id: containerId } = await createRes.json();

    const startRes = await fetch(`${DOCKER_API}/containers/${containerId}/start`, { method: 'POST' });
    if (!startRes.ok && startRes.status !== 304) {
        console.error("[-] container start failed:", startRes.status);
        await fetch(`${DOCKER_API}/containers/${containerId}?force=true`, { method: 'DELETE' });
        await removeInstanceNetwork(networkName);
        return { success: false, rc: 500, error: 'Failed to start container' };
    }

    armExpiryTimer(containerId, expiresAt);

    return {
        success: true,
        rc: 200,
        message: 'SSH Instance Created!',
        container_id: containerId,
        port,
        password,
        expires_at: expiresAt.toISOString(),
    };
}

export async function StopInstance(containerId) {
    if (!containerId) {
        return { success: false, rc: 400, error: 'Missing container_id' };
    }

    const timer = expiryTimers.get(containerId);
    if (timer) clearTimeout(timer);
    expiryTimers.delete(containerId);

    let networkName;
    const inspectRes = await fetch(`${DOCKER_API}/containers/${containerId}/json`);
    if (inspectRes.ok) {
        const info = await inspectRes.json();
        networkName = info.Config?.Labels?.[KHI_NETWORK_LABEL];
    }

    const stopRes = await fetch(`${DOCKER_API}/containers/${containerId}/stop`, { method: 'POST' });
    if (!stopRes.ok && stopRes.status !== 304 && stopRes.status !== 404) {
        console.error("[-] container stop failed:", stopRes.status);
        return { success: false, rc: 500, error: 'Failed to stop container' };
    }

    await removeInstanceNetwork(networkName);

    return { success: true, rc: 200, message: 'SSH Instance Stopped' };
}

export async function CreateWebInstance(challengeId, image_ref) {
    if (!challengeId || !image_ref) {
        return { success: false, rc: 400, error: 'Missing challengeId or image_ref' };
    }

    if (!isAllowedImage(image_ref, WEB_IMAGE_PREFIX)) {
        return { success: false, rc: 403, error: 'Image not allowed' };
    }

    let resolvedImage;
    try {
        resolvedImage = await resolveImage(image_ref);
    } catch (e) {
        console.error("[-] image resolution failed:", e);
        return { success: false, rc: 500, error: 'Failed to pull image' };
    }

    let containerPort;
    try {
        containerPort = await getExposedContainerPort(resolvedImage);
    } catch (e) {
        console.error("[-] image inspect failed:", e);
        return { success: false, rc: 500, error: e.message ?? 'Failed to inspect image' };
    }

    const port = await GetUnusedWebPort();
    if (port === -1) {
        return { success: false, rc: 500, error: 'No free web ports available' };
    }

    const { pidsLimit, memBytes } = await getResourceLimits(resolvedImage);

    let networkName;
    try {
        networkName = await createInstanceNetwork();
    } catch (e) {
        console.error("[-] network creation failed:", e);
        return { success: false, rc: 500, error: 'Failed to create network' };
    }

    const createRes = await fetch(`${DOCKER_API}/containers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Image: resolvedImage,
            Labels: {
                [KHI_TYPE_LABEL]: KHI_WEB_TYPE_VALUE,
                [KHI_CHALLENGE_LABEL]: String(challengeId),
                [KHI_NETWORK_LABEL]: networkName,
            },
            ExposedPorts: { [containerPort]: {} },
            HostConfig: {
                PortBindings: { [containerPort]: [{ HostPort: String(port) }] },
                NetworkMode: networkName,
                AutoRemove: false,
                NanoCpus: WEB_INSTANCE_CPU_NANOS,
                Memory: memBytes,
                PidsLimit: pidsLimit,
            },
        }),
    });

    if (!createRes.ok) {
        console.error("[-] container create failed:", createRes.status, await createRes.text());
        await removeInstanceNetwork(networkName);
        return { success: false, rc: 500, error: 'Failed to create container' };
    }

    const { Id: containerId } = await createRes.json();

    const startRes = await fetch(`${DOCKER_API}/containers/${containerId}/start`, { method: 'POST' });
    if (!startRes.ok && startRes.status !== 304) {
        console.error("[-] container start failed:", startRes.status);
        await fetch(`${DOCKER_API}/containers/${containerId}?force=true`, { method: 'DELETE' });
        await removeInstanceNetwork(networkName);
        return { success: false, rc: 500, error: 'Failed to start container' };
    }

    return {
        success: true,
        rc: 200,
        message: 'Web Instance Created!',
        container_id: containerId,
        port,
    };
}

export async function StopWebInstance(containerId) {
    if (!containerId) {
        return { success: false, rc: 400, error: 'Missing container_id' };
    }

    let networkName;
    const inspectRes = await fetch(`${DOCKER_API}/containers/${containerId}/json`);
    if (inspectRes.ok) {
        const info = await inspectRes.json();
        networkName = info.Config?.Labels?.[KHI_NETWORK_LABEL];
    }

    const stopRes = await fetch(`${DOCKER_API}/containers/${containerId}/stop`, { method: 'POST' });
    if (!stopRes.ok && stopRes.status !== 304 && stopRes.status !== 404) {
        console.error("[-] container stop failed:", stopRes.status);
        return { success: false, rc: 500, error: 'Failed to stop container' };
    }

    await fetch(`${DOCKER_API}/containers/${containerId}?force=true`, { method: 'DELETE' });
    await removeInstanceNetwork(networkName);

    return { success: true, rc: 200, message: 'Web Instance Stopped' };
}

async function cleanupOrphanedNetworks() {
    const filters = encodeURIComponent(JSON.stringify({ label: [`${KHI_NET_LABEL}=${KHI_NET_VALUE}`] }));
    const res = await fetch(`${DOCKER_API}/networks?filters=${filters}`);
    if (!res.ok) {
        console.error("[-] failed to list networks for cleanup:", res.status);
        return;
    }

    const networks = await res.json();
    for (const network of networks) {
        if (Object.keys(network.Containers || {}).length === 0) {
            console.log(`[*] Removing orphaned network ${network.Name}...`);
            await removeInstanceNetwork(network.Name);
        }
    }
}

export async function ReconcileOnBoot() {
    const containers = await ListInstances();
    console.log(`[*] Reconciling ${containers.length} running SSH instance(s)...`);

    for (const container of containers) {
        const expiresAtLabel = container.Labels?.[KHI_EXPIRES_LABEL];
        if (!expiresAtLabel) continue;

        const remainingMs = new Date(expiresAtLabel).getTime() - Date.now();
        if (remainingMs <= 0) {
            console.log(`[*] ${container.Id} already past expiry, stopping...`);
            await StopInstance(container.Id);
        } else {
            armExpiryTimer(container.Id, expiresAtLabel);
        }
    }

    await cleanupOrphanedNetworks();
}
