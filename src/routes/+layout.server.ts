import { auth } from '$lib/server/auth';

/**
 * Grab the current session and user information
 * from the auth configuration
 * 
 * @param event 
 * @returns 
 */
export const load = async (event) => {
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    return {
        user: session?.user ?? null,
        session: session?.session ?? null,
    };
};