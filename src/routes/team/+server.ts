import { AcceptMember, DeclineRequest, IsTeamLeader, RemoveMember } from "$lib/database/db";
import { auth } from "$lib/server/auth";
import { error, json } from "@sveltejs/kit";

export const POST = async ({ url , request }) => {
    try {
        const mode = url.searchParams.get('m');

        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session || !session.user)
            throw error(400, "Bad Session");

        // check if the session belongs to a team-leader
        if ( await !IsTeamLeader(session.user.id) )
            throw error(401, "Team Leaders Only");

        // process post-req
        if (mode === "accept") {
            const { rid, r_checksum } = await request.json();
    
            if (!rid || !r_checksum)
                throw error(400, "Invalid Data");
    
            return json(await AcceptMember(rid, r_checksum));
        } else if (mode === "decline") {
            const { rid, r_checksum } = await request.json();

            if (!rid || !r_checksum)
                throw error(400, "Invalid Data");

            return json(await DeclineRequest(rid, r_checksum));
        } else if (mode === "rm_member") {
            const { uid, name, team_id } = await request.json();
    
            if (!uid || !name || !team_id)
                throw error(400, "Invalid Data");
    
            return json(await RemoveMember(team_id, uid));
        } else {
            console.log("[*] Missing url-parameter");
            throw error(500, "Error Occurred");
        }
    } catch (e) {
        console.error(e);
        throw error(500, "Error Occurred");
    }
};