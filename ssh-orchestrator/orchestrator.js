const DOCKER_PROXY_HOST = process.env.DOCKER_PROXY_HOST ?? 'docker-socket-proxy';
const DOCKER_PROXY_PORT = process.env.DOCKER_PROXY_PORT ?? '2375';
const DOCKER_API = `http://${DOCKER_PROXY_HOST}:${DOCKER_PROXY_PORT}`;

const KHI_TYPE_LABEL = 'khi.type';
const KHI_TYPE_VALUE = 'ssh-instance';

const SSH_MIN_PORT = Number(process.env.SSH_MIN_PORT);
const SSH_MAX_PORT = Number(process.env.SSH_MAX_PORT);

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
