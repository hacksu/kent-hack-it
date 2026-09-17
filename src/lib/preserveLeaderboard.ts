import { FindMembers, type LeaderboardEntry } from "./database/db";
import { writeFile } from 'fs/promises';
import * as path from 'path';

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

export async function ArchiveLeaderboard(year: number, board: LeaderboardEntry[]) {
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
        const fpath = path.join(base_dir, `${year}.json`);
        await writeFile(fpath, data);

        return { success: true, message: `KHI ${year} leaderboard archived!` }
    } catch (e:any) {
        console.error(`[-] ArchiveLeaderboard -> ${e}`);
        return { success: false, error: "An error occurred" }
    }
}