import type { ActionResult } from "@sveltejs/kit";

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

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };