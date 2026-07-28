import { env } from "$env/dynamic/private";

const KEY_HEX = process.env.FLAG_ENCRYPTION_KEY ?? env.FLAG_ENCRYPTION_KEY;

async function importKey(): Promise<CryptoKey> {
    if (!KEY_HEX || KEY_HEX.length !== 64) {
        throw new Error("FLAG_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)");
    }
    const keyBytes = Uint8Array.from(Buffer.from(KEY_HEX, "hex"));
    return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptFlag(plaintext: string): Promise<string> {
    const key = await importKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return Buffer.from(combined).toString("base64");
}

export async function decryptFlag(encoded: string): Promise<string> {
    const key = await importKey();
    const combined = Buffer.from(encoded, "base64");
    const iv = combined.subarray(0, 12);
    const ciphertext = combined.subarray(12);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plaintext);
}
