import { writeFile } from "fs/promises";
import * as path from "path";

export enum WriteMode {
    Overwrite,
    KeepExisting,
}

const FILE_EXISTS = "EEXIST";

// "wx" fails instead of replacing a file that is already there
const FLAG_BY_MODE = {
    [WriteMode.Overwrite]: "w",
    [WriteMode.KeepExisting]: "wx",
};

/**
 * Writes `<year>.json` into the history directory.
 *
 * @returns false when KeepExisting found an archive already in place
 */
export async function WriteArchiveFile(dir: string, year: number, json: string, mode: WriteMode): Promise<boolean> {
    try {
        await writeFile(path.join(dir, `${year}.json`), json, { flag: FLAG_BY_MODE[mode] });
        return true;
    } catch (e) {
        if (e instanceof Error && "code" in e && e.code === FILE_EXISTS) {
            return false;
        }
        throw e;
    }
}
