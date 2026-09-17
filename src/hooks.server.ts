import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment'
import { auth } from "$lib/server/auth";
import cron from 'node-cron';
import { GetEventDate } from '$lib/utilities';
import { ArchiveLeaderboard } from '$lib/preserveLeaderboard';
import { GetLeaderboard } from '$lib/database/db';

function runBackgroundJob() {
    console.log("[*] Starting background cron-jobs...");
    
    // Runs once a day at 2:00 AM server time
    cron.schedule(`0 2 * * *`, async () => {
        const currYear = new Date().getFullYear().toString();

        const eventData = await GetEventDate();
        if (!eventData.end || new Date() < eventData.end) return;


        let leaderboard = await GetLeaderboard();
        while (leaderboard.length === 0) {
            console.warn("[!] Leaderboard fetch Failed, retrying...");
            leaderboard = await GetLeaderboard();
        }

        let result = await ArchiveLeaderboard(currYear, leaderboard);
        while (!result.success) {
            console.warn("[!] Auto-Archive Failed, retrying...");
            result = await ArchiveLeaderboard(currYear, leaderboard);
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