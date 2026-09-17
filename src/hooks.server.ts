import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment'
import { auth } from "$lib/server/auth";

import cron from 'node-cron';
import { setTimeout } from 'node:timers/promises';
import { GetEventDate } from '$lib/utilities';
import { ArchiveLeaderboard } from '$lib/preserveLeaderboard';
import { GetLeaderboard } from '$lib/database/db';

declare global {
    var __cronJobStarted: boolean | undefined;
}

function runBackgroundJob() {
    if (building) return;

    if (globalThis.__cronJobStarted) {
        console.log("[*] Background cron-job already running, skipping re-registration.");
        return;
    }
    globalThis.__cronJobStarted = true;

    console.log("[*] Starting background cron-jobs...");

    /** @todo - Need singleton approach so we do not have 20 cronjobs running */
    
    // Runs once a day at 2:00 AM server time
    cron.schedule(`0 2 * * *`, async () => {
        const currYear = new Date().getFullYear();

        const eventData = await GetEventDate();
        if (!eventData.end || new Date() < eventData.end) return;


        let leaderboard = await GetLeaderboard();
        let retry = 0;
        while (leaderboard.length === 0 && retry < 5) {
            console.warn("[!] Leaderboard fetch Failed, retrying...");
            leaderboard = await GetLeaderboard();
            ++retry;

            // Sleep for 2000 milliseconds
            await setTimeout(2000);
        }
        if (retry >= 5) {
            console.error("[-] Could not fetch leaderboard!")
            return
        }

        let result = await ArchiveLeaderboard(currYear, leaderboard);
        retry = 0;
        while (!result.success && retry < 5) {
            console.warn("[!] Auto-Archive Failed, retrying...");
            result = await ArchiveLeaderboard(currYear, leaderboard);
            ++retry;
            
            // Sleep for 2000 milliseconds
            await setTimeout(2000);
        }
        if (retry >= 5) {
            console.error("[-] Could not archive leaderboard!")
            return
        }

        console.log(`[+] KHI ${currYear} leaderboard has been auto-archived!`)
    });
}

// runs when the server process starts
runBackgroundJob();

export const handle: Handle = async ({ event, resolve }) => {
    // prevent AI crawling into non-root areas of KHI
    const response = await svelteKitHandler({event, resolve, auth, building});
	if (event.url.pathname !== '/') {
		response.headers.set(
			'X-Robots-Tag',
			'noai, noimageai, noindex'
		);
	}

    return response;
}