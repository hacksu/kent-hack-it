import { FindMembers, type LeaderboardEntry } from "./database/db";
import { WriteArchiveFile, WriteMode } from "./archiveFile";

/*
-------- LAYOUT --------
{
    "board": [
        { "name": "user1", "score": 500 },
        { "name": "user2", "score": 450 },
        {
            "name": "team1",
            "score": 300,
            "members": [ "user3", "user4" ]
        }
    ]
}
*/

export async function ArchiveLeaderboard(year: number, board: LeaderboardEntry[], mode: WriteMode = WriteMode.Overwrite) {
    try {
        let entries = [];
        for (const entry of board) {
            entries.push({
                name: entry.name,
                score: entry.score,
                members: await FindMembers(entry.name)
            });
        }
        
        const base_dir = "/app/khi_history/";
        const data = JSON.stringify({ "board": entries });
        const written = await WriteArchiveFile(base_dir, year, data, mode);
        if (!written) {
            const message = `KHI ${year} was already archived, keeping the existing file`;
            console.log(`[*] ${message}`);
            return { success: true, message }
        }

        return { success: true, message: `KHI ${year} leaderboard archived!` }
    } catch (e:any) {
        console.error(`[-] ArchiveLeaderboard -> ${e}`);
        return { success: false, error: "An error occurred" }
    }
}