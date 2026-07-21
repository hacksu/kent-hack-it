const DOCKER_PROXY_HOST = process.env.DOCKER_PROXY_HOST ?? 'docker-socket-proxy';
const DOCKER_PROXY_PORT = process.env.DOCKER_PROXY_PORT ?? '2375';
const DOCKER_API = `http://${DOCKER_PROXY_HOST}:${DOCKER_PROXY_PORT}`;

const KHI_TYPE_LABEL = 'khi.type';
const KHI_TYPE_VALUE = 'ssh-instance';

const SSH_MIN_PORT = Number(process.env.SSH_MIN_PORT);
const SSH_MAX_PORT = Number(process.env.SSH_MAX_PORT);

const SSH_INSTANCE_CPU_NANOS = Number(process.env.SSH_INSTANCE_CPU_NANOS ?? 1000000000);
const SSH_INSTANCE_MEM_BYTES = Number(process.env.SSH_INSTANCE_MEM_BYTES ?? 268435456);
const SSH_INSTANCE_MINUTES = Number(process.env.SSH_INSTANCE_MINUTES ?? 45);
const SSH_INSTANCES_NETWORK = process.env.SSH_INSTANCES_NETWORK ?? 'khi_ssh_instances_net';

const KHI_UID_LABEL = 'khi.uid';
const KHI_EXPIRES_LABEL = 'khi.expires_at';

/**
 * List currently-running SSH instance containers via docker-socket-proxy.
 * Deliberately stateless -- always queries Docker fresh rather than
 * tracking allocations in memory, so it stays correct across restarts.
 *
 * @returns {Promise<any[]>}
 */
export async function ListInstances() {
    const filters = encodeURIComponent(JSON.stringify({ label: [`${KHI_TYPE_LABEL}=${KHI_TYPE_VALUE}`] }));
    const res = await fetch(`${DOCKER_API}/containers/json?all=false&filters=${filters}`);
    if (!res.ok) {
        throw new Error(`Docker API list failed: ${res.status}`);
    }
    return await res.json();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function hostPortOf(container) {
    const binding = (container.Ports || []).find(p => p.PrivatePort === 22 && p.PublicPort);
    return binding ? binding.PublicPort : null;
}

/**
 * Pick a free host port in SSH_MIN_PORT-SSH_MAX_PORT against the
 * currently-running instance list.
 *
 * @returns {Promise<number>} a free port, or -1 if none are available
 */
export async function GetUnusedSSHPort() {
    const containers = await ListInstances();
    const usedPorts = new Set(containers.map(hostPortOf).filter(Boolean));

    const candidates = [];
    for (let port = SSH_MIN_PORT; port <= SSH_MAX_PORT; port++) {
        candidates.push(port);
    }
    shuffle(candidates);

    for (const port of candidates) {
        if (!usedPorts.has(port)) return port;
    }
    return -1;
}

function generatePassword() {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

const expiryTimers = new Map();

/**
 * Arm (or re-arm) the in-process timer that stops a container once its
 * khi.expires_at label elapses. Purely a convenience for prompt cleanup --
 * the label itself is the durable source of truth, re-read at boot by
 * reconciliation, not this map.
 *
 * @param {string} containerId
 * @param {Date|string} expiresAt
 */
function armExpiryTimer(containerId, expiresAt) {
    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    const timer = setTimeout(() => {
        console.log(`[*] Expiry reached for ${containerId}, stopping...`);
        StopInstance(containerId);
    }, Math.max(remainingMs, 0));
    timer.unref();
    expiryTimers.set(containerId, timer);
}

/**
 * Create and start a new SSH instance container for a participant.
 *
 * @param {string} uid
 * @param {string} image_ref
 * @returns
 */
export async function CreateSSHInstance(uid, image_ref) {
    if (!uid || !image_ref) {
        return { success: false, rc: 400, error: 'Missing uid or image_ref' };
    }

    const port = await GetUnusedSSHPort();
    if (port === -1) {
        return { success: false, rc: 500, error: 'No free SSH ports available' };
    }

    const password = generatePassword();
    const expiresAt = new Date(Date.now() + SSH_INSTANCE_MINUTES * 60 * 1000);

    const createRes = await fetch(`${DOCKER_API}/containers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Image: image_ref,
            Env: [`CTF_PASSWORD=${password}`],
            Labels: {
                [KHI_TYPE_LABEL]: KHI_TYPE_VALUE,
                [KHI_UID_LABEL]: uid,
                [KHI_EXPIRES_LABEL]: expiresAt.toISOString(),
            },
            ExposedPorts: { "22/tcp": {} },
            HostConfig: {
                PortBindings: { "22/tcp": [{ HostPort: String(port) }] },
                NetworkMode: SSH_INSTANCES_NETWORK,
                AutoRemove: true,
                NanoCpus: SSH_INSTANCE_CPU_NANOS,
                Memory: SSH_INSTANCE_MEM_BYTES,
            },
        }),
    });

    if (!createRes.ok) {
        console.error("[-] container create failed:", createRes.status, await createRes.text());
        return { success: false, rc: 500, error: 'Failed to create container' };
    }

    const { Id: containerId } = await createRes.json();

    const startRes = await fetch(`${DOCKER_API}/containers/${containerId}/start`, { method: 'POST' });
    if (!startRes.ok && startRes.status !== 304) {
        console.error("[-] container start failed:", startRes.status);
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

/**
 * Stop a running SSH instance container. AutoRemove was set at create
 * time, so stopping it also removes it -- no DELETE call needed.
 *
 * @param {string} containerId
 * @returns
 */
/**
 * Re-arm expiry timers for any already-running SSH instances at boot,
 * reading khi.expires_at directly off each container's own label --
 * so a redeploy of this service doesn't orphan running instances.
 */
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
}

export async function StopInstance(containerId) {
    if (!containerId) {
        return { success: false, rc: 400, error: 'Missing container_id' };
    }

    const timer = expiryTimers.get(containerId);
    if (timer) clearTimeout(timer);
    expiryTimers.delete(containerId);

    const stopRes = await fetch(`${DOCKER_API}/containers/${containerId}/stop`, { method: 'POST' });
    if (!stopRes.ok && stopRes.status !== 304 && stopRes.status !== 404) {
        console.error("[-] container stop failed:", stopRes.status);
        return { success: false, rc: 500, error: 'Failed to stop container' };
    }

    return { success: true, rc: 200, message: 'SSH Instance Stopped' };
}
