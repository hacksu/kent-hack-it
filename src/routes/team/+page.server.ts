import { GetOpenTeams, GetTeam, LeaveTeam, MakeTeam } from '$lib/database/db.js';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
    const { user } = await parent();

    // admins cannot have teams therefor redirect admins to admin panel
    if (!user) throw redirect(303, '/auth/login');
    if (user.role === 'admin') throw redirect(303, '/admin');

    return {
        teams: await GetOpenTeams(),
        team: await GetTeam(user.id)
    }
};

export const actions = {
    // special form named-target
    create_team: async ({ request, locals }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            return await MakeTeam(session.user.id, formData.name);
        } catch (e) {
            console.error(`[-] Team Creation: ${e}`);
        }
    },
    request_join: async ({ request, locals }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            return { success: true, message: 'Request Sent!' };
        } catch (e) {
            console.error(`[-] Team-Request: ${e}`);
        }
    },
    leave_team: async ({ request, locals }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session)
            throw redirect(303, '/auth/login');

        const form = await request.formData();
        const formData = Object.fromEntries(form.entries()) as Record<string, string>;

        try {
            return await LeaveTeam(session.user.id, formData.team_id);
        } catch (e) {
            console.error(`[-] Team-Request: ${e}`);
        }
    },
};