import fs from 'fs/promises';
import path from 'path';
import { execSync, spawn } from 'child_process';

import { GetUnusedPort, CheckFile, PathExists, CreateDir, CreateFile } from './utils_h.js';

export const MIN_PORT = process.env.MIN_PORT ?? 0;
export const MAX_PORT = process.env.MAX_PORT ?? 0;
export const BINS_FOLDER = process.env.BIN_UPLOADS_DIR ?? path.join(process.cwd(), "ctf");
export const NSJAIL_CONFS_FOLDER = process.env.JAIL_CONF_DIR ?? path.join(process.cwd(), "nsjail_confs");

const SESSION_TIMEOUT = 15 * 60; // 15 minutes
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT * 1000;

/**
 * Helper method to generate the nsjail command use by instance handler
 * 
 * @param {*} jailDir 
 * @param {*} bin_path 
 * @returns 
 */
function buildNsjailCmd(jailDir, jail_conf) {
    if (typeof jail_conf.entrypoint !== 'string') {
        console.error('[-] Invalid jail entrypoint string!');
        return [];
    }
    if (!Array.isArray(jail_conf.files)) {
        console.error('[-] Invalid jail file array!');
        return [];
    }

    const src_flag_path = path.join(jailDir, "flag.txt");
    const entrypoint_bin = path.normalize(
        path.join(BINS_FOLDER, jail_conf.entrypoint)
    );
    const nsjail_main = path.normalize(
        path.join("/", jail_conf.entrypoint)
    );

    let nsjail_cmd = [
        "/usr/bin/nsjail",
        "-Mo",                                      // standalone-once: exit after one connection, no session reuse
        "--chroot", jailDir                         // jail root IS the challenge dir — nothing outside is reachable
    ];

    let nsjail_rbinds = [
        "-R", `${entrypoint_bin}:${nsjail_main}`,
        "-R", `${src_flag_path}:/flag.txt`,
        "-R", "/lib64",
        "-R", "/lib/x86_64-linux-gnu"
    ];
    
    for (const f of jail_conf.files) {
        const requestedPath = path.normalize(f);
        if (requestedPath.startsWith("/lib")) {
            // @todo - This might need expanded to support other additions
            nsjail_rbinds.push("-R", requestedPath);
        } else {
            // we know at this point this is a challenge file
            const bin_path = path.normalize(
                path.join(BINS_FOLDER, f)
            );
            const jail_bin = path.normalize(
                path.join("/", f)
            );
            nsjail_rbinds.push("-R", `${bin_path}:${jail_bin}`);
        }
    }

    // append args into main cmd list
    nsjail_cmd = [
        ...nsjail_cmd,
        ...nsjail_rbinds
    ];

    const nsjail_general = [
        "-R", "/usr/bin/sh:/bin/sh",            // pwntools looks for /bin/sh
        "-R", "/usr/bin/bash:/bin/bash",        // some people pref. bash
        "-R", "/usr/bin/sh",
        "-R", "/usr/bin/bash",

        "-R", "/usr/bin/id",
        "-R", "/usr/bin/whoami",
        "-R", "/usr/bin/ls",
        "-R", "/usr/bin/cat",
        "-l", "/tmp/nsjail.log",                 // general logging for debugging

        "--cwd", "/",                            // jail-root == chal_dir, so this is correct post-chroot
        "-U", "99999:33:1",
        "-G", "99999:33:1",

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
        `${nsjail_main}`
    ]
    nsjail_cmd = [
        ...nsjail_cmd,
        ...nsjail_general
    ];

    return nsjail_cmd;
}

async function ParseJailConfig(nsjail_conf) {
    try {
        // verify path
        console.log("[*] Checking najail config path...");
        const { success, rc, message } = await CheckFile(NSJAIL_CONFS_FOLDER, nsjail_conf, false);
        if (!success) return { success, rc, error: message };

        const nsjail_conf_path = path.normalize(
            path.join(NSJAIL_CONFS_FOLDER, nsjail_conf)
        );
        const data = JSON.parse(await fs.readFile(nsjail_conf_path, 'utf-8'));

        // check for required attributes
        if (!data.files || !data.entrypoint) {
            console.error(`[-] nsjail config '${nsjail_conf_path}' is missing required attributes!`);
            return { success: false, rc: 500, error: 'Server Error' };
        }

        // type verify
        if (typeof data.entrypoint !== 'string') {
            console.error(`[-] nsjail config '${nsjail_conf_path}' entrypoint is invalid!`);
            return { success: false, rc: 500, error: 'Server Error' };
        }
        if (!Array.isArray(data.files)) {
            console.error(`[-] nsjail config '${nsjail_conf_path}' files is invalid!`);
            return { success: false, rc: 500, error: 'Server Error' };
        }

        // verify all requested jail files
        const entry_included = data.files.find(f => f === data.entrypoint);
        const jail_files = entry_included ? data.files : [data.entrypoint, ...data.files];
        for (const f of jail_files) {
            let requestedPath = path.normalize(f);
            if (requestedPath.startsWith("/lib")) {
                // @todo - This might need expanded to support other additions

                // check abs non-exec files (i.e., libc.so.6)
                if (await PathExists(f)) continue;
            } else {
                const jail_bin = path.normalize(
                    path.join("/", f)
                );

                // check executable challenge files
                requestedPath = path.normalize(
                    path.join(BINS_FOLDER, jail_bin)
                );

                if (requestedPath.startsWith(BINS_FOLDER)) {
                    // check executable binary files
                    if (await CheckFile(BINS_FOLDER, jail_bin)) continue;
                } else {
                    // files we include within nsjail come strictly from BINS_FOLDER or
                    // are to a system resource using absolute path like libc.so.6
                    console.error(`[-] Requested jail file '${f}' is within an invalid location!`);
                    return { success: false, rc: 500, error: 'Server Error' };
                }
            }

            console.error(`[-] Requested jail file '${f}' does not exist!`);
            return { success: false, rc: 500, error: 'Server Error' };
        }

        console.log(`[+] nsjail config '${nsjail_conf_path}' parsed successfully!`);
        return { success: true, rc: 200, message: '' };
    } catch (e) {
        console.error("[ParseJailConfig] Error Occurred:", e);
        return { success: false, rc: 500, error: 'Server Error' };
    }
}

/**
 * Generates the initial file-system directory nsjail will use as the root
 * for a newly created jail
 * 
 * @param {*} jailDir 
 * @param {*} flag_value 
 * @returns 
 */
async function CreateJail(jailDir, flag_value) {
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

    return { success: true, rc: 200, message: '' };
}

export async function CreateInstance(name, nsjail_conf, flag_value) {
    
    {
        console.log("[*] Parsing nsjail config...");
        const { success, rc, error } = await ParseJailConfig(nsjail_conf);
        if (!success) {
            console.error(`[-] Error Parsing '${NSJAIL_CONFS_FOLDER}/${nsjail_conf}'`);
            console.error(` |___ ${error}`);
            return { success: false, rc, error };
        }
    }

    const nsjail_conf_path = path.normalize(
        path.join(NSJAIL_CONFS_FOLDER, nsjail_conf)
    );
    const jail_conf = JSON.parse(await fs.readFile(nsjail_conf_path, 'utf-8'));

    // create jail-cell based on challenge name provided
    const jailDir = path.join("/jail", name);

    {
        console.log(`[*] Generating jail for '${name}'...`);
        const { success, rc, error } = await CreateJail(jailDir, flag_value);
        if (!success) {
            console.error(`[-] Error making jail for '${name}'...`);
            return { success: false, rc, error };
        }
    }

    // in order to properly execute nsjail through socat we are
    // providing socat a bash file because the nsjail command
    // will be large
    const jobFile = path.join("/app/jobs", name + ".sh");
    const jailcmd = buildNsjailCmd(jailDir, jail_conf);
    if (jailcmd.length === 0) {
        return { success: false, rc: 500, error: `Invalid nsjail configuration provided! --> ${nsjail_conf_path}` };
    }

    console.log("[*] Writing Job File", jobFile);

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