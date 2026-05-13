import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { GetChallenge } from "$lib/database/db";

export const POST: RequestHandler = async ({ params }) => {
    const cid = params.cid;

    try {
        const challenge = await GetChallenge(cid);

        if (!challenge || challenge.length === 0)
            throw error(404, "Challenge not found.");

        return json(challenge[0]);
    } catch (e) {
        throw error(404, "Challenge not found.");
    }
};