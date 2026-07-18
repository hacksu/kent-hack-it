import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { join, basename, normalize } from "path";
import { readFile } from "fs/promises";
import { IsSiteActive } from "$lib/database/db";

export const GET: RequestHandler = async ({ params, url }) => {
    if (!await IsSiteActive())
        throw error(503, "Site Inactive (Download Unavailable)");

    const type = url.searchParams.get('t');
    let basePath = "";
    let contentType = "";

    if (type === 'archive') {
        // search from archives directory
        basePath = process.env.UPLOADS_DIR ?? join(process.cwd(), "uploads");
        contentType = "application/zip";
    } else if (type === 'bin') {
        // search from binaries directory
        basePath = process.env.BIN_UPLOADS_DIR ?? join(process.cwd(), "ctf");
        contentType = "application/octet-stream";
    } else {
        throw error(404, "Not Found.");
    }

    // path checking for path traversal
    const requestedPath = normalize(join(basePath, params.file ?? ""));
    if (!requestedPath.startsWith(basePath)) {
        throw error(403, "Access denied.");
    }

    try {
        const file = await readFile(requestedPath);
        const filename = basename(requestedPath);

        return new Response(file, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": file.length.toString()
            }
        });
    } catch (e: any) {
        console.log("[-] Download-Error:", e);
        throw error(404, "File not found.");
    }
};