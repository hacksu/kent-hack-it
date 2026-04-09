import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();
    
    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');
};