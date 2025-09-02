import crypto from 'crypto';

// Function designed to attempt to sanitize strings
export function SanitizeString(input) {
    // Force to string
    const str = String(input);

    // Only allow letters, numbers, underscores, hyphens, periods, @
    // help prevent someone from using: '{"$ne": ""}' which can
    // lead to NoSQL Injection
    const allowedPattern = /^[a-zA-Z0-9@._\-!]+$/;

    // Invalid string input string detected
    if (!allowedPattern.test(str)) {
        return null;
    }

    // this string is clean we can use it
    return str;
}

export function ValidRatingNumber(num) {
    const numeric = Number(num);
    return !(
        isNaN(numeric) ||
        numeric <= 0 ||
        (numeric * 10) % 5 !== 0
    );
}

export function Hash_SHA256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

export function Generate_Checksum() {
    return Hash_SHA256(crypto.randomBytes(64).toString('hex'));
}

export function SanitizeAlphaNumeric(input) {
    return input.replace(/[^a-zA-Z0-9]/g, '');
}