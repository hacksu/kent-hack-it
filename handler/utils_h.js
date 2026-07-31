import net from "net";
import path from 'path';
import fs from 'fs/promises';

import { BINS_FOLDER } from "./handler";

// @section - General File-System Operations

export async function PathExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

export async function CreateDir(path) {
    try {
        await fs.mkdir(path, { recursive: true });
        return true;
    } catch {
        return false;
    }
}

export async function CreateFile(path, content = "") {
    try {
        await fs.writeFile(path, content);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if a given base_dir/file path is valid and exists
 * 
 * @param {string} base_dir - The base directory
 * @param {string} file - The file path relative to base_dir
 * @param {boolean} [make_exec=true] - Whether to make the file executable
 * @returns
 */
export async function CheckFile(base_dir, file, make_exec=true) {
    try {
        console.log(`[*] Testing ${base_dir}/${file}`);
        // check if the dir is valid
        const requestedPath = path.normalize(
            path.join(base_dir, file)
        );
        if (!requestedPath.startsWith(base_dir)) {
            console.log("[*] Potential Mal-Path...");
            return { success: false, rc: 403, message: 'Potentially Malicious' };
        }
        await fs.access(requestedPath);

        if (make_exec) {
            await fs.chmod(requestedPath, 0o755); // set executable-bit
        }
        return { success: true, rc: 200, message: '' };
    } catch (e) {
        console.error("[-] Error:", e);
        return { success: false, rc: 500, message: 'Server Error' };
    }
}



// @section - nsjail Utilities

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
export async function GetUnusedPort(MIN, MAX) {
    MIN = Number(MIN) || 0;
    MAX = Number(MAX) || 0;

    if (MIN === MAX) {
        console.error("[-] Cannot fetch unused-port, MIN/MAX values are the same!")
        return -1;
    }
    if (MIN > MAX) {
        console.error("[-] Cannot fetch unused-port, MIN is larger than MAX!")
        return -1;
    }

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
 * Given a list of file strings within a nsjail configuration
 * append special rbinds to them
 * 
 * @param {*} files 
 * @param {*} nsjail_rbinds 
 */
export function buildRbinds(files, nsjail_rbinds) {
    for (const f of files) {
        const requestedPath = path.normalize(f);
        if (requestedPath.startsWith("/lib")) {
            nsjail_rbinds.push("-R", requestedPath);
        } else {
            const bin_path = path.normalize(path.join(BINS_FOLDER, f));
            const jail_bin = path.normalize(path.join("/", f));
            nsjail_rbinds.push("-R", `${bin_path}:${jail_bin}`);
        }
    }
}