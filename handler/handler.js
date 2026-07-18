import net from "net";
import fs from 'fs/promises';
import path from 'path';
import { execSync, spawn } from 'child_process';

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export async function GetUnusedPort(MIN, MAX) {
    // Generate the port list
    const ports = [];
    for (let port = MIN; port <= MAX; port++) {
        ports.push(port);
    }

    // Randomize the order
    shuffle(ports);

    // Test each port
    for (const port of ports) {
        const available = await new Promise((resolve) => {
            const server = net.createServer();

            server.once("error", () => resolve(false));

            server.once("listening", () => {
                server.close(() => resolve(true));
            });

            server.listen(port, "127.0.0.1");
        });

        if (available) {
            return port;
        }
    }

    return -1;
}

/**
 * Check if a given bin_dir+bin path is valid
 * and exists and enables the executable-bit
 * on valid existing paths
 * 
 * @param {*} bin_dir 
 * @param {*} bin 
 * @returns 
 */
export async function CheckFile(bin_dir, bin) {
    try {
        console.log(`[*] Testing ${bin_dir}/${bin}`);
        // check if the dir is valid
        const requestedPath = path.normalize(
            path.join(bin_dir, bin)
        );
        if (!requestedPath.startsWith(bin_dir)) {
            console.log("[*] Potential Mal-Path...");
            return { success: false, rc: 403, message: 'Potentially Malicious' };
        }

        await fs.access(requestedPath);
        await fs.chmod(requestedPath, 0o755); // set executable-bit
        return { success: true, rc: 200, message: '' };
    } catch (e) {
        console.error("[-] Error:", e);
        return { success: false, rc: 500, message: 'Server Error' };
    }
}

const SESSION_TIMEOUT = 15 * 60; // 15 minutes
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT * 1000;

/**
 * Helper method to generate the nsjail command use by instance handler
 * 
 * @param {*} jailDir 
 * @param {*} bin_path 
 * @returns 
 */
function buildNsjailCmd(jailDir, bin_path) {
    const bin_name = path.basename(bin_path);
    const src_flag_path = path.join(jailDir, "flag.txt");
    return [
        "/usr/bin/nsjail",
        "-Mo",                                      // standalone-once: exit after one connection, no session reuse
        "--chroot", jailDir,                        // jail root IS the challenge dir — nothing outside is reachable

        "-R", `${bin_path}:/${bin_name}`,           // move binary
        "-R", `${src_flag_path}:/flag.txt`,         // move flag.txt
        "-R", "/lib64",
        "-R", "/lib/x86_64-linux-gnu",

        "-R", "/usr/bin/sh:/bin/sh",                        // pwntools looks for /bin/sh
        "-R", "/usr/bin/bash:/bin/bash",                    // some people pref. bash
        "-R", "/usr/bin/sh",
        "-R", "/usr/bin/bash",

        "-R", "/usr/bin/id",
        "-R", "/usr/bin/whoami",
        "-R", "/usr/bin/ls",
        "-R", "/usr/bin/cat",

        "-l", "/tmp/nsjail.log",                 // general logging for debugging

        "--cwd", "/",                            // jail-root == chal_dir, so this is correct post-chroot
        "--user", "ctf-player",
        "--group", "ctf-player",

        // --- resource limits ---
        "--rlimit_as", "512",
        "--rlimit_cpu", "30",
        "--rlimit_fsize", "1",
        "--rlimit_nofile", "32",
        "--time_limit", String(SESSION_TIMEOUT),
        "--max_conns_per_ip", "4",               // cap concurrent connections from one IP (basic anti-abuse)

        // --- privilege/attack-surface reduction ---
        "--disable_proc",                        // no /proc inside jail — no host PID/mount info leakage
        // NOTE: removed --disable_clone_newnet.
        // That flag *disables* network namespace isolation, meaning the
        // jailed process previously shared the host's real network stack —
        // letting an RCE reach out (exfil, pivoting, hitting internal
        // services). Dropping the flag restores the namespace isolation
        // (nsjail's default), giving the jailed process no network at all.

        "--",
        `/${bin_name}`,
    ];
}

async function PathExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

async function CreateDir(path) {
    try {
        await fs.mkdir(path, { recursive: true });
        return true;
    } catch {
        return false;
    }
}
async function CreateFile(path, content = "") {
    try {
        await fs.writeFile(path, content);
        return true;
    } catch {
        return false;
    }
}

export async function CreateInstance(name, bin_dir, bin, flag_value) {
    console.log("[*] Checking bin path...");

    {
        // executables exists within bin_dir
        const { success, rc, message } = await CheckFile(bin_dir, bin);
        if (!success) {
            console.error(`[-] '${BINS_FOLDER}/${bin}' might not exist...`);
            return { success: false, rc, error: message };
        }
    }

    // create jail-cell based on challenge name provided
    const jailDir = path.join("/jail", name);
    console.log(`[*] Checking '${jailDir}'...`);
    if (!await PathExists(jailDir)) {
        console.log("[*] Creating directory", jailDir);
        if (!await CreateDir(jailDir)) {
            console.error("[-] Failed to create", jailDir);
            return { success: false, rc: 500, error: 'Server Error' }
        }
    }

    // write flag inside jail
    const flagFile = path.join(jailDir, "flag.txt");
    console.log("[*] Creating Flag File", flagFile);
    if (!await CreateFile(flagFile, flag_value)) {
        console.error("[-] Failed to create", flagFile);
        return { success: false, rc: 500, error: 'Server Error' }
    }

    // write jail passwd file
    const jailPasswd = path.join(jailDir, "/etc/passwd");

    console.log(`[*] Checking '${path.dirname(jailPasswd)}'...`);
    if (!await PathExists(path.dirname(jailPasswd))) {
        console.log("[*] Creating directory", path.dirname(jailPasswd));
        if (!await CreateDir(path.dirname(jailPasswd))) {
            console.error("[-] Failed to create", path.dirname(jailPasswd));
            return { success: false, rc: 500, error: 'Server Error' }
        }
    }

    console.log("[*] Creating Jail-Passwd File", jailPasswd);
    if (!await CreateFile(jailPasswd, "ctf-player:x:99999:99999::/:/bin/sh")) {
        console.error("[-] Failed to create", jailPasswd);
        return { success: false, rc: 500, error: 'Server Error' }
    }

    // write nsjail job file
    const jobFile = path.join("/app/jobs", name + ".sh");
    if (!await PathExists(jobFile)) {
        // prepare jailcmd
        const bin_path = path.join(bin_dir, bin);
        const jailcmd = buildNsjailCmd(jailDir, bin_path);

        console.log("[*] Creating Job File", jobFile);

        // generate script content
        let job_fc = "#!/bin/bash\n";
        for (const arg of jailcmd) {
            job_fc += `${arg} `;
        }
        job_fc += '\n';

        if (!await CreateFile(jobFile, job_fc)) {
            console.error("[-] Failed to create", jobFile);
            return { success: false, rc: 500, error: 'Server Error' };
        }

        try {
            await fs.chmod(jobFile, 0o755); // set executeable-bit
        } catch (e) {
            console.error("[-] Error:", jobFile);
            return { success: false, rc: 500, error: 'Server Error' };
        }
    }

    // prep socat cmd
    const MIN_PORT = process.env.MIN_PORT ?? 0;
    const MAX_PORT = process.env.MAX_PORT ?? 0;
    if (MIN_PORT === MAX_PORT) {
        console.error("[-] Invalid MIN/MAX Port Values!");
        return { success: false, rc: 500, error: 'Server Error' };
    }

    const RPORT = await GetUnusedPort(MIN_PORT, MAX_PORT);
    if (RPORT === -1) {
        console.error("[-] No valid port can be found!");
        return { success: false, rc: 500, error: 'Server Error' };
    }

    const socatSystem = "EXEC:" + jobFile + ",pty,stderr,setsid,sigint,raw,echo=0";
    const procCmd = [
        `TCP-LISTEN:${RPORT},reuseaddr,fork`,
        socatSystem
    ];

    console.log("[*] Starting Instance CPID");

    // start handler socat jail child process
    const proc = spawn("/usr/bin/socat", procCmd);
    proc.on('error', (err) => {
        console.error(`[-] socat spawn error: ${err}`);
    });

    const timer = setTimeout(() => {
        if (proc.exitCode === null && !proc.killed) {
            proc.kill();
        }
    }, SESSION_TIMEOUT_MS);
    timer.unref();

    return {
        success: true,
        rc: 200,
        message: 'Instance Created!',
        cpid: proc.pid,
        port: RPORT
    };
}