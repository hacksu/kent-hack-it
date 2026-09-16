import { auth } from "$lib/server/auth";
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from '$app/environment'

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