import { GetConfiguration } from "./database/db";

export function randomString(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(b => chars[b % chars.length])
        .join('');
}

/**
 * Hash a given message using SHA-256
 * 
 * @param message 
 * @returns SHA-256 hash string
 */
export async function SHA256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    // no import needed for `crypto.subtle`
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 
 * @returns date information regarding when the event starts and ends
 */
export async function GetEventDate() {
    const config = await GetConfiguration();
    if (!config) return {};

    const start = new Date(config.event_start);
    const end = new Date(config.event_start);
    end.setDate(end.getDate() + config.event_length);

    return {
        start: start,
        end: end
    }
}