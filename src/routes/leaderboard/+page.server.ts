import { type LeaderboardEntry, GetLeaderboard, GetTeamFromPlayer } from "$lib/database/db";

export const load = async ({ parent }) => {
    const { user } = await parent();

    const leaderboard = await GetLeaderboard();
    let self_placement: LeaderboardEntry | undefined = leaderboard.find(entry => entry.name === user?.name );

    async function FindSelf() {
        // if the user is not solo find their team
        if (!self_placement && user) {
            // find the team the user is associated with
            const membership = await GetTeamFromPlayer(user.id);
            if (membership) {
                self_placement = leaderboard.find(entry => entry.name === membership.name );
            }
        }
    }
    await FindSelf();
    
    return {
        board: leaderboard,
        user_placement: self_placement
    };
};