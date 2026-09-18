import { readFile, readdir } from "fs/promises";
import * as path from 'path';

const onlyNumbers = /^\d+$/;
/**
 * Returns true if a string is a positive integer
 * @param str 
 * @returns 
 */
function isNumericString(str: string): boolean {
    return onlyNumbers.test(str);
}

/**
 * Read "year".json file and return the JSON object to be displayed on the web-page
 * @param year 
 */
async function GetEventHistory(year: string) {
    const hist_file = `/app/khi_history/${year}.json`;
    try {
        const raw = await readFile(hist_file, "utf-8");
        return JSON.parse(raw);
    } catch (e: any) {
        console.error(`[-] Error reading history file '${hist_file}'`)
        return undefined;
    }
}

/**
 * 
 * @returns array of leaderboard archive json file names WITHOUT .json
 * @example [ "2024", "2025", ... ]
 */
async function GetArchivedEvents() {
    try {
        const base_dir = "/app/khi_history/";

        // Read all files and folders in the directory
        const files = await readdir(base_dir);

        // Filter out files that end with '.json'
        const jsonFiles = files
            .filter(file => path.extname(file).toLowerCase() === '.json')
            .map(file => path.basename(file, path.extname(file)))
            .sort((a, b) => Number(b) - Number(a));

        return jsonFiles;
    } catch (e: any) {
        console.error(`[-] Error fetching leaderboard archives: ${e}`)
        return [];
    }
}

export const load = async ({ url }) => {
    var data: { year: string, evt_archives: string[], history: any} = {
        year: "unknown",
        evt_archives: await GetArchivedEvents(),
        history: undefined
    };

    var year: any = url.searchParams.get('year');
    if (!year) {
        // invalid param
        return data;
    }

    year = String(year);
    if (!isNumericString(year) || year.length > 4) {
        // invalid param
        return data;
    }

    year = Number(year); // resolve "0100" or other combinations like this
    if (year < 0) {
        // invalid param
        return data;
    }
    const s_year = String(year);

    data.year = s_year;
    // year was converted from string -> int -> string
    data.history = await GetEventHistory(s_year);

    return data;
};