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

export function IsAdmin(req) {
    if (!req.user) return false;
    console.log(JSON.stringify(req.user));
    return req.user.is_admin === true
}

//###############################################
//              FILE UPLOADING
//###############################################

import multer from 'multer'; // middle-ware for file checking

// Set up storage to preserve original filename
// on default multer uses checksum to name file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `${process.env.CHALLENGE_UPLOAD_DIR}`); // upload destination
    },
    filename: (req, file, cb) => {
        cb(null, SanitizeFileName(file.originalname)); // replace spaces for underscores
    }
});
export const upload = multer({ storage: storage });

// file name sanitizing while maintaining file endings (.zip, .txt, etc)
export function SanitizeFileName(filename) {
    try {
        // Find last dot position
        const lastDotIndex = filename.lastIndexOf('.');
        
        let namePart = filename;
        let extensionPart = '';
        
        if (lastDotIndex !== -1) {
            namePart = filename.slice(0, lastDotIndex);
            extensionPart = filename.slice(lastDotIndex + 1);
        }
        
        // Replace whitespace with underscores, and remove invalid chars from name part
        namePart = namePart
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');
        
        // Sanitize extension: only letters and numbers
        extensionPart = extensionPart.replace(/[^a-zA-Z0-9]/g, '');
        
        if (extensionPart.length > 0) {
            return `${namePart}.${extensionPart}`;
        } else {
            return namePart; // no extension
        }
    } catch {
        console.error("[-] Error occured Sanatizing Uploaded File Name!")
        return Hash_SHA256(filename);
    }
}