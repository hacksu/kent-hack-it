const DOCKER_PROXY_HOST = process.env.DOCKER_PROXY_HOST ?? 'docker-socket-proxy';
const DOCKER_PROXY_PORT = process.env.DOCKER_PROXY_PORT ?? '2375';
const DOCKER_API = `http://${DOCKER_PROXY_HOST}:${DOCKER_PROXY_PORT}`;

const KHI_TYPE_LABEL = 'khi.type';
const KHI_TYPE_VALUE = 'ssh-instance';

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
