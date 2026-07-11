import { error, redirect, json, isRedirect } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { GetActiveInstance } from "$lib/database/db";
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

        const data = await GetActiveInstance(session.user.id);
        const instance_info = data
            ? { active: true, host: "ctf.hacksu.com", rport: data.port, created_at: data.created_at }
            : { active: false };

        console.log(instance_info);

        return json(instance_info);
    } catch (e: any) {
        if (isRedirect(e)) throw e;
        console.log("[-] Get-Instance-Error:", e);
        throw error(404, "Instance not found.");
    }
};