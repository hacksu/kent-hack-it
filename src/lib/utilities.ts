import type { ActionResult } from "@sveltejs/kit";

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
 * Reviews the result from a form's use:enhance and returns
 * the Feedback success, error, warning messages
 * 
 * @param result 
 * @returns 
 */
export async function handleFormResult(result: ActionResult<Record<string, unknown> | undefined, Record<string, unknown> | undefined>) {
    let error = "";
    let warning = "";
    let success = "";

    if (result.type === 'success' && result.data) {
        if (result.type === 'success' && result.data) {
            // perform a cast to avoid error/warning popups
            const data = result.data as {
                success: boolean;
                message?: string;
                warning?: string;
                error?: string;
            };
            
            if (data.success && data.message) {
                success = data.message;
                warning = data.warning ?? "";
            } else {
                error = data.message ?? data.error ?? 'Error Occurred!';
            }
        } else {
            error = 'Error Occurred!';
        }
    } else {
        error = "Error Occurred!";
    }

    return {success, warning, error};
}