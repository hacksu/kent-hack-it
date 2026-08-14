import { error, redirect, json, isRedirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { auth } from "$lib/server/auth";
import { GetWebInstance } from "$lib/database/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, url }) => {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            throw redirect(302, "/auth/login");
        }

        const cid = url.searchParams.get("cid");
        if (!cid) {
            return json({ active: false });
        }

        const CHALLENGE_HOST = process.env.CHALLENGE_HOST ?? env.CHALLENGE_HOST ?? "ctf.hacksu.com";

        const data = await GetWebInstance(cid);
        const instance_info = data
            ? { active: true, host: CHALLENGE_HOST, port: data.port }
            : { active: false };

        return json(instance_info);
    } catch (e: any) {
        if (isRedirect(e)) throw e;
        console.log("[-] Get-Web-Instance-Error:", e);
        throw error(404, "Web Instance not found.");
    }
};
