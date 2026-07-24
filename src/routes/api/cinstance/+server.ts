import { error, redirect, json, isRedirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { GetActiveInstance, GetActiveSSHInstance } from "$lib/database/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, url }) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // user not authenticated
        if (!session) {
            throw redirect(302, "/auth/login");
        }

        const CHALLENGE_HOST = process.env.CHALLENGE_HOST ?? env.CHALLENGE_HOST ?? "ctf.hacksu.com";
        const cid = Number(url.searchParams.get('cid'));

        const [data, sshData] = await Promise.all([
            GetActiveInstance(session.user.id),
            GetActiveSSHInstance(session.user.id),
        ]);

        const active = !!data && data.challenge_id === cid;
        const other_active = (!!data && !active) || !!sshData;

        const instance_info = active
            ? { active: true, host: CHALLENGE_HOST, rport: data.port, created_at: data.created_at, other_active: false }
            : { active: false, other_active };

        console.log(instance_info);

        return json(instance_info);
    } catch (e: any) {
        if (isRedirect(e)) throw e;
        console.log("[-] Get-Instance-Error:", e);
        throw error(404, "Instance not found.");
    }
};