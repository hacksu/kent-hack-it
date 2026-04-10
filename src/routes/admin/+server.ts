import { isAdmin } from '$lib/server/auth';
import { ToggleChallenge, DeleteChallenge } from '$lib/database/db';
import { json } from '@sveltejs/kit';

async function toggleChallenge(id: string, is_active: boolean) {
    await ToggleChallenge(id, is_active);

    return json({ success: 'true' }, { status: 200 });
}

async function deleteChallenge(id: string) {
    await DeleteChallenge(id);

    return json({ success: 'true' }, { status: 200 });
}

export const POST = async (event) => {
    // check user authorizations
    const authCheck = await isAdmin(event.request);
    if (authCheck.status !== 200) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await event.request.json();
    let handler: Response;

    console.log(data);

    // action required
    if (!data?.action) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (data.action === 'toggle') {
        // method is invoked and the return is saved to be passed
        // into the ret stmt below
        handler = await toggleChallenge(data.id, data.is_active);
    } else if (data.action === 'delete') {
        handler = await deleteChallenge(data.id);
    } else {
        // unknown action
        return json({ error: 'Server Error' }, { status: 500 });
    }

    return handler;
};