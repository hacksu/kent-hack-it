import { isAdmin } from '$lib/server/auth';
import {
    ToggleChallenge, DeleteChallenge,
    DeleteAdmin,
    DeleteUser,
    RemoveTeam,
    StopInstance,
} from '$lib/database/db';
import { json } from '@sveltejs/kit';

async function toggleChallenge(id: string, is_active: boolean, is_gym: boolean) {
    try {
        return json(
            await ToggleChallenge(id, is_active, is_gym)
        );
    } catch (e: any) {
        return json({ success: false, error: "Error Occurred", status: 200 });
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

async function deleteUser(id: string) {
    if ( await DeleteUser(id) ) {
        return json({ success: true , status: 200 });
    } else {
        return json({ success: false , status: 200 });
    }
}

async function stopInstance(uid: string) {
    return json(await StopInstance(uid));
}

async function deleteTeam(id: string) {
    console.log("[*] Remove Team ->", id);
    if ( await RemoveTeam(id) ) {
        return json({ success: true , status: 200 });
    } else {
        return json({ success: false , status: 200 });
    }
}

import { rm } from "fs/promises";
import { join, basename } from "path";
async function delFile(is_archive: boolean, file: string) {
    const filename = basename(file);
    let basePath = "";

    if (is_archive) {
        // remove from archives directory
        basePath = process.env.UPLOADS_DIR ?? join(process.cwd(), "uploads");
    } else {
        // remove from binaries directory
        basePath = process.env.BIN_UPLOADS_DIR ?? join(process.cwd(), "ctf");
    }

    // check for path traversal
    const filepath = join(basePath, filename);
    if (!filepath.startsWith(basePath)) {
        return json({ success: false , status: 403 });
    }

    try {
        await rm(filepath);
        return json({ success: true , status: 200 });
    } catch {
        return json({ success: false , status: 500 });
    }
}

export const POST = async (event) => {
    // check user authorizations
    if (!await isAdmin(event.request)) {
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
            handler = await toggleChallenge(data.id, data.is_active, data.is_gym);
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
    } else if (data.context === 'user') {
        if (data.action === 'delete') {
            handler = await deleteUser(data.id);
        } else {
            // unknown action
            return json({ success: false, error: 'Unknown action' , status: 500 });
        }
    } else if (data.context === 'file') {
        if (data.action === 'del_zip') {
            handler = await delFile(true, data.file);
        } else if (data.action === 'del_bin') {
            handler = await delFile(false, data.file);
        } else {
            // unknown action
            return json({ success: false, error: 'Unknown action' , status: 500 });
        }
    } else if (data.context === 'instance') {
        if (data.action === 'stop') {
            handler = await stopInstance(data.uid);
        } else {
            // unknown action
            return json({ success: false, error: 'Unknown action' , status: 500 });
        }
    } else if (data.context === 'team') {
        if (data.action === 'delete') {
            handler = await deleteTeam(data.id);
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
