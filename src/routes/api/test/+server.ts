import { env } from "$env/dynamic/private";
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
    return new Response(JSON.stringify({
        env: env.TESTING_READ
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};