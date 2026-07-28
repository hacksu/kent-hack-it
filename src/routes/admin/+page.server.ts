import { redirect, fail } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth'
import {
    AddChallenge, GetChallenges, UpdateChallenge,
    GetAdmins,
    GetUsers, GetTeams, GetSolvers,
    GetConfiguration,
    UpdateConfiguration,
    GetFlagHash,
    GetActiveInstances,
    EnsureWebInstance, RedeployWebInstance
} from "$lib/database/db";

import ParseLog from '$lib/parse_log';
import { ListRegistryImages } from '$lib/server/registry';

import { readdir, writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";

// importing interface alias
import type { ChallengeForm } from "$lib/database/db";
import { SHA256 } from '$lib/utilities';
import { encryptFlag } from '$lib/server/flag-crypto';

const uploadDir = process.env.UPLOADS_DIR ?? join(process.cwd(), "uploads");
const binUploadDir = process.env.BIN_UPLOADS_DIR ?? join(process.cwd(), "ctf");
const jailConfDir = process.env.JAIL_CONF_DIR ?? join(process.cwd(), "nsjail_confs");

async function GetFiles(search_dir: string): Promise<string[]> {
    let files: string[] = [];
    try {
        files = await readdir(search_dir);
    } catch {
        files = [];
    }
    return files;
}

// sent to +page.svelte => data. (user,challenges,admins, ...)
export const load = async ({ parent }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();

    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');
    if (user.role !== 'admin') throw redirect(303, '/');

    let challenges = await GetChallenges(true);
    let admins = await GetAdmins();
    let players = await GetUsers();
    let files = {
        archives: await GetFiles(uploadDir),
        bins: await GetFiles(binUploadDir),
        jail_confs: await GetFiles(jailConfDir)
    };
    let teams = await GetTeams();
    let config = await GetConfiguration();
    let solvers = await GetSolvers();
    let log_data = await ParseLog();
    let instances = await GetActiveInstances();
    let registry_images = await ListRegistryImages();

    return {
        user, challenges,
        admins, players,
        teams,
        files,
        config,
        solvers,
        log_data,
        instances,
        registry_images,
    }
};

const PointValues = {
    "simple": 100,
    "easy": 200,
    "medium": 300,
    "hard": 400,
    "extreme": 500,
};

export const actions = {
    // special form named-target
	add_challenge: async ({ request }) => {
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;
        
        const attached_files = form.getAll("attached_files") as string[];
        const hints = JSON.parse(formData['hints'] || '[]') as string[];

        if (!formData.name || !formData.description || !formData.written_by || 
            !formData.category || !formData.difficulty || !formData.flag)
            return fail(400, { error: 'Missing required data' });

        const points = PointValues[formData.difficulty.toLowerCase() as keyof typeof PointValues];
        if (!points)
            return fail(400, { error: 'Invalid difficulty value' });

        try {
            const data: ChallengeForm = {
                name: formData.name,
                description: formData.description,
                written_by: formData.written_by,
                category: formData.category,
                difficulty: formData.difficulty,
                flag: formData.nsjail_conf ? await encryptFlag(formData.flag) : await SHA256(formData.flag),
                points,
                hlinks: attached_files,
                hints,
                nsjail_conf: formData.nsjail_conf,
                image_ref: formData.image_ref || null,
                web_image_ref: formData.web_image_ref || null,
            };

            const result = await AddChallenge(data);
            if (!result.success) {
                return fail(409, { error: result.error });
            }

            if (data.web_image_ref) {
                await EnsureWebInstance(result.id);
            }
            return { success: true, message: 'Challenge added!' };
        } catch (e) {
            console.error(`[-] Add_Challenge -> ${e}`);
            return fail(500, { error: 'An error occurred while adding the challenge' });
        }
    },
    edit_challenge: async ({ request }) => {
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const attached_files = form.getAll("attached_files") as string[];
        const hints = JSON.parse(formData['hints'] || '[]') as string[];

        if (!formData.id || !formData.name || !formData.description ||
            !formData.written_by || !formData.category || !formData.difficulty)
            return fail(400, { error: 'Missing required data' });

        const points = PointValues[formData.difficulty.toLowerCase() as keyof typeof PointValues];
        if (!points)
            return fail(400, { error: 'Invalid difficulty value' });

        // if flag is not given reuse whats within the db
        let flag_value = formData.flag;
        if (!flag_value || flag_value.length === 0) {
            flag_value = await GetFlagHash(formData.id);
        } else {
            flag_value = formData.nsjail_conf ? await encryptFlag(formData.flag) : await SHA256(formData.flag);
        }

        try {
            console.log("[!] Admin is modifying a challenge");

            const result = await UpdateChallenge({
                name: formData.name,
                description: formData.description,
                written_by: formData.written_by,
                category: formData.category,
                difficulty: formData.difficulty,
                flag: flag_value,
                points,
                hlinks: attached_files,
                hints,
                nsjail_conf: formData.nsjail_conf,
                image_ref: formData.image_ref || null,
                web_image_ref: formData.web_image_ref || null,
            }, formData.id);

            if (!result.success) {
                return fail(409, { error: result.error });
            }

            if (formData.web_image_ref) {
                await RedeployWebInstance(result.id);
            }

            return { success: true, message: 'Challenge updated!' };
        } catch (e) {
            console.error(`[-] Edit_Challenge -> ${e}`);
            return fail(500, { error: 'An error occurred while updating the challenge' });
        }
    },
    
    update_config: async ({ request }) => {
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');

        try {
            console.log("[!] Admin is modifying event config");

            const form = await request.formData();
            const formData = Object.fromEntries(form.entries()) as Record<string, string>;

            const start_date = new Date(formData['start-date']);
            const evt_duration = formData['event-length'];
            const activation = formData['activation-status'].toLowerCase() === "true";

            return await UpdateConfiguration({
                event_start: start_date,
                event_length: Number(evt_duration),
                site_active: activation
            });
        } catch (e) {
            console.error(`[-] Update_Config -> ${e}`);
            return fail(500, { error: 'An error occurred while updating configuration' });
        }
    },

    upload_files: async ({ request }) => {
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');

        try {
            const form = await request.formData();
            let files = form.getAll("challenge_archives") as File[];

            console.log(files);
            files.forEach(f => {
                console.log(`${f} : ${f.size}`);
            });

            // check for file sizes and remove large files
            const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

            const largeFiles = files.filter(f => f.size > MAX_FILE_SIZE);
            files = files.filter(f => f.size <= MAX_FILE_SIZE);

            if (files.length === 0 || files.every(f => f.size === 0)) {
                return { 
                    success: false,
                    error: "No files provided."
                };
            }

            // Check every file is a zip
            const invalidFiles = files.filter(f => {
                const isZipMime = f.type === "application/zip" || f.type === "application/x-zip-compressed";
                const isZipExt = basename(f.name).toLowerCase().endsWith(".zip");
                return !isZipMime || !isZipExt;
            });

            if (invalidFiles.length > 0) {
                return {
                    success: false, 
                    error: `Only .zip files are allowed: ${invalidFiles.map(f => f.name).join(", ")}`
                };
            }

            // Check for valid magic bytes
            for (const file of files) {
                const buffer = Buffer.from(await file.arrayBuffer());
                if (buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
                    return fail(400, { error: `${file.name} is not a valid zip file.` });
                }
            }

            console.log(`[*] Saving Files to: ${uploadDir}`);
            await mkdir(uploadDir, { recursive: true });

            for (const file of files) {
                const safeName = basename(file.name);
                const buffer = Buffer.from(await file.arrayBuffer());
                await writeFile(join(uploadDir, safeName), buffer);
            }

            return (largeFiles.length === 0) ? {
                success: true,
                message: "Files Uploaded!"
            } : {
                success: true,
                warning: "Some files were not uploaded due to size"
            };
        } catch (e) {
            console.error(`[-] File Upload -> ${e}`);
            return {
                success: false,
                error: "An error occurred while uploading files"
            };
        }
    },
    upload_exec_files: async ({ request }) => {
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');

        try {
            const form = await request.formData();
            let files = form.getAll("bins") as File[];

            console.log(files);
            files.forEach(f => {
                console.log(`${f} : ${f.size}`);
            });

            // check for file sizes and remove large files
            const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

            const largeFiles = files.filter(f => f.size > MAX_FILE_SIZE);
            files = files.filter(f => f.size <= MAX_FILE_SIZE);

            if (files.length === 0 || files.every(f => f.size === 0)) {
                return { 
                    success: false,
                    error: "No bin files provided."
                };
            }

            console.log(`[*] Saving Bin Files to: ${binUploadDir}`);
            await mkdir(binUploadDir, { recursive: true });

            for (const file of files) {
                const safeName = basename(file.name);
                const buffer = Buffer.from(await file.arrayBuffer());
                await writeFile(join(binUploadDir, safeName), buffer);
            }

            return (largeFiles.length === 0) ? {
                success: true,
                message: "Bin Files Uploaded!"
            } : {
                success: true,
                warning: "Some files were not uploaded due to size"
            };
        } catch (e) {
            console.error(`[-] Bin File Upload -> ${e}`);
            return {
                success: false,
                error: "An error occurred while uploading files"
            };
        }
    },
    upload_jail_conf: async ({ request }) => {
        if (!await isAdmin(request))
            throw redirect(303, '/auth/login');

        try {
            const form = await request.formData();
            let files = form.getAll("jail_confs") as File[];

            console.log(files);
            files.forEach(f => {
                console.log(`${f} : ${f.size}`);
            });

            // check for file sizes and remove large files
            const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

            const largeFiles = files.filter(f => f.size > MAX_FILE_SIZE);
            files = files.filter(f => f.size <= MAX_FILE_SIZE);

            if (files.length === 0 || files.every(f => f.size === 0)) {
                return { 
                    success: false,
                    error: "No jail configs provided."
                };
            }

            console.log(`[*] Saving nsjail Files to: ${jailConfDir}`);
            await mkdir(jailConfDir, { recursive: true });

            for (const file of files) {
                const safeName = basename(file.name);
                const buffer = Buffer.from(await file.arrayBuffer());
                await writeFile(join(jailConfDir, safeName), buffer);
            }

            return (largeFiles.length === 0) ? {
                success: true,
                message: "nsjail Configurations Uploaded!"
            } : {
                success: true,
                warning: "Some files were not uploaded due to size"
            };
        } catch (e) {
            console.error(`[-] nsjail config upload -> ${e}`);
            return {
                success: false,
                error: "An error occurred while uploading files"
            };
        }
    },
};