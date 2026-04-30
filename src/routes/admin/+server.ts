import { isAdmin } from '$lib/server/auth';
import {
    ToggleChallenge, DeleteChallenge,
    DeleteAdmin,
} from '$lib/database/db';
import { json } from '@sveltejs/kit';

async function toggleChallenge(id: string, is_active: boolean) {
    if ( await ToggleChallenge(id, is_active) ) {
        return json({ success: true , status: 200 });
    } else {
        return json({ success: false , status: 200 });
    }
}

async function deleteChallenge(id: string) {
    if ( await DeleteChallenge(id) ) {
        return json({ success: true , status: 200 });
    } else {
        return json({ success: false , status: 200 });
    }
}

async function deleteAdmin(id: string) {
    if ( await DeleteAdmin(id) ) {
        return json({ success: true , status: 200 });
    } else {
        return json({ success: false , status: 200 });
    }
}

export const POST = async (event) => {
    // check user authorizations
    const authCheck = await isAdmin(event.request);
    if (authCheck.status !== 200) {
        return json({ success: false, error: 'Unauthorized' , status: 401 });
    }

    const data = await event.request.json();
    let handler: Response;

    console.log(data);

    // context required
    if (!data?.context) {
        return json({ success: false, error: 'Invalid Data' , status: 401 });
    }

    // action required
    if (!data?.action) {
        return json({ success: false, error: 'Invalid Data' , status: 401 });
    }

    if (data.context === 'challenge') {
        if (data.action === 'toggle') {
            // method is invoked and the return is saved to be passed
            // into the ret stmt below
            handler = await toggleChallenge(data.id, data.is_active);
        } else if (data.action === 'delete') {
            handler = await deleteChallenge(data.id);
        } else {
            // unknown action
            return json({ success: false, error: 'Unknown action' , status: 500 });
        }
    } else if (data.context === 'admin') {
        if (data.action === 'delete') {
            handler = await deleteAdmin(data.id);
        } else {
            // unknown action
            return json({ success: false, error: 'Unknown action' , status: 500 });
        }
    } else {
        // unknown context
        return json({ success: false, error: 'Unknown context' , status: 500 });
    }

    return handler;
};