import { error, redirect, json, isRedirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { GetActiveSSHInstance, StopSSHInstance, CreateSSHInstance, GetActiveInstance } from "$lib/database/db";
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

        const [data, ncData] = await Promise.all([
            GetActiveSSHInstance(session.user.id),
            GetActiveInstance(session.user.id),
        ]);

        const active = !!data && data.challenge_id === cid;
        const other_active = (!!data && !active) || !!ncData;

        const instance_info = active
            ? {
                active: true,
                host: CHALLENGE_HOST,
                port: data.port,
                password: data.password,
                expires_at: data.expires_at,
                other_active: false,
            }
            : { active: false, other_active };

        return json(instance_info);
    } catch (e: any) {
        if (isRedirect(e)) throw e;
        console.log("[-] Get-SSH-Instance-Error:", e);
        throw error(404, "SSH Instance not found.");
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // user not authenticated
        if (!session) {
            throw redirect(302, "/auth/login");
        }

        const uid = session.user.id;
        const { action, cid } = await request.json();

        if (action === "stop") {
            return json(await StopSSHInstance(uid));
        } else if (action === "restart") {
            if (!cid) {
                return json({ success: false, error: "Missing cid" }, { status: 400 });
            }
            return json(await CreateSSHInstance(uid, cid));
        }

        return json({ success: false, error: "Unknown action" }, { status: 400 });
    } catch (e: any) {
        if (isRedirect(e)) throw e;
        console.log("[-] Post-SSH-Instance-Error:", e);
        throw error(500, "Failed to update SSH Instance.");
    }
};
