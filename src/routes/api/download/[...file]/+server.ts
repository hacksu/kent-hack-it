import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { join, basename, normalize } from "path";
import { readFile } from "fs/promises";

export const GET: RequestHandler = async ({ params }) => {
    const uploadDir = join(process.cwd(), "uploads");

    // path checking for path traversal
    const requestedPath = normalize(join(uploadDir, params.file ?? ""));
    if (!requestedPath.startsWith(uploadDir)) {
        throw error(403, "Access denied.");
    }

    try {
        const file = await readFile(requestedPath);
        const filename = basename(requestedPath);

        // wrap content-type with zip as we only expect zip
        // files to be downloaded from this endpoint
        return new Response(file, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": file.length.toString()
            }
        });
    } catch {
        throw error(404, "File not found.");
    }
};