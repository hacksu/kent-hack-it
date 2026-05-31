import { env } from "$env/dynamic/private";
import { readFile } from "fs/promises";

export interface LogEntry {
    ip: string;
    user: string;
    time: string;
    method: string;
    uri: string;
    protocol: string;
    status: number;
    bytesSent: number;
    referer: string;
    userAgent: string;
    requestTime: number;
}

// nginx log regex
const LOG_REGEX = /^(\S+) - (\S+) \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)" rt=(\S+)$/;

export default async function ParseLog(): Promise<LogEntry[]> {
    try {
        const logPath = env.LOG_FILE ?? process.env.LOG_FILE ?? "/var/log/nginx/access.log";
        const raw = await readFile(logPath, "utf-8");
    
        return raw
            .split("\n")
            .filter(line => line.trim().length > 0)
            .flatMap(line => {
                const m = LOG_REGEX.exec(line);
                if (!m) return [];
                return [{
                    ip:          m[1],
                    user:        m[2],
                    time:        m[3],
                    method:      m[4],
                    uri:         m[5],
                    protocol:    m[6],
                    status:      parseInt(m[7]),
                    bytesSent:   parseInt(m[8]),
                    referer:     m[9],
                    userAgent:   m[10],
                    requestTime: parseFloat(m[11]),
                }];
            });
    } catch (e: any) {
        console.error("[-] Error:", e);
        return [];
    }
}