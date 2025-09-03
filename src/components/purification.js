import DOMPurify from "dompurify";
export function SanitizeDescription(description) {
    const cleanDescription = DOMPurify.sanitize(description, {
        USE_PROFILES: { html: true } // allows safe HTML (basic formatting, links, etc.)
    });
    return cleanDescription;
}