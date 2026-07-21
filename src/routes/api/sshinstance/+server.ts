import { error, redirect, json, isRedirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { GetActiveSSHInstance, StopSSHInstance, CreateSSHInstance } from "$lib/database/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // user not authenticated
        if (!session) {
            throw redirect(302, "/auth/login");
        }

        const CHALLENGE_HOST = process.env.CHALLENGE_HOST ?? env.CHALLENGE_HOST ?? "ctf.hacksu.com";

        const data = await GetActiveSSHInstance(session.user.id);
        const instance_info = data
            ? {
                active: true,
                host: CHALLENGE_HOST,
                port: data.port,
                password: data.password,
                expires_at: data.expires_at,
            }
            : { active: false };

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
