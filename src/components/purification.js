import DOMPurify from "dompurify";
export function SanitizeDescription(targetTag, description) {
    const cleanDescription = DOMPurify.sanitize(description, {
        USE_PROFILES: { html: true } // allows safe HTML (basic formatting, links, etc.)
    });

    if (targetTag) {
        try {
            targetTag.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (err) {
            console.error(err);
        }
    }
    
    return cleanDescription;
}