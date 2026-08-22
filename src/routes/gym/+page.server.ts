import { redirect } from '@sveltejs/kit';

import {
    GetProgress, GetChallenges,
    GetCompletions, GetSolversCount, GetRated,
    type ViewableChallengeData,
} from "$lib/database/db";
import { challengeActions } from "$lib/server/challenge-actions";

export const load = async ({ parent }) => {
    // goes to +layout.server.ts and fetches the user state
    const { user } = await parent();

    // redirect unauthenticated users to login
    if (!user) throw redirect(303, '/auth/login');

    let challenges = await GetChallenges(false, 2) as ViewableChallengeData[] | undefined; // only fetch gym challenges
    const completions = await GetCompletions(user.id);
    const rated = await GetRated(user.id);
    const progressData = await GetProgress(user.id);

    // modify object to attach the solvers attribute
    for (let c of challenges || []) {
        c['solves'] = await GetSolversCount(c.id);
    }

    return {
        user, challenges, progressData, completions, rated
    }
};

// FORM DATA HANDLING ONLY - POSTS ARE HANDLED IN +server.ts
export const actions = challengeActions;
