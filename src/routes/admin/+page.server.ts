import { redirect, fail } from '@sveltejs/kit';
import { isAdmin } from '$lib/server/auth'
import {
    AddChallenge, GetChallenges, UpdateChallenge,
    GetAdmins,
    GetUsers, GetTeams
} from "$lib/database/db";

import { readdir, writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";

// importing interface alias
import type { ChallengeForm } from "$lib/database/db";

async function GetArchives(): Promise<string[]> {
    const uploadDir = join(process.cwd(), "uploads");
    let files: string[] = [];
    try {
        files = await readdir(uploadDir);
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
    let files = await GetArchives();
    let teams = await GetTeams();

    return {
        user, challenges,
        admins, players,
        teams,
        files,
    }
};

const PointValues = {
    "simple": 100,
    "easy": 200,
    "medium": 300,
    "hard": 400,
    "extreme": 500,
};

// FORM DATA HANDLING ONLY - POSTS ARE HANDLED IN +server.ts
export const actions = {
    // special form named-target
	add_challenge: async ({ cookies, request }) => {
        if (await isAdmin(request))
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        let formData = Object.fromEntries(form.entries()) as Record<string, string>;
        
        const attached_files = form.getAll("attached_files") as string[];

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
                flag: formData.flag,
                points,
                hlinks: attached_files
            };

            await AddChallenge(data);
            return { success: true, message: 'Challenge added!' };
        } catch (e) {
            console.error(`[-] Add_Challenge -> ${e}`);
            return fail(500, { error: 'An error occurred while adding the challenge' });
        }
    },
    edit_challenge: async ({ request }) => {
        if (await isAdmin(request))
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        const attached_files = form.getAll("attached_files") as string[];

        if (!formData.id || !formData.name || !formData.description ||
            !formData.written_by || !formData.category || !formData.difficulty || !formData.flag)
            return fail(400, { error: 'Missing required data' });

        const points = PointValues[formData.difficulty.toLowerCase() as keyof typeof PointValues];
        if (!points)
            return fail(400, { error: 'Invalid difficulty value' });

        try {
            console.log("[!] Admin is modifying a challenge");

            await UpdateChallenge({
                name: formData.name,
                description: formData.description,
                written_by: formData.written_by,
                category: formData.category,
                difficulty: formData.difficulty,
                flag: formData.flag,
                points,
                hlinks: attached_files
            }, formData.id);

            return { success: true, message: 'Challenge updated!' };
        } catch (e) {
            console.error(`[-] Edit_Challenge -> ${e}`);
            return fail(500, { error: 'An error occurred while updating the challenge' });
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

            const uploadDir = join(process.cwd(), "uploads");
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
};