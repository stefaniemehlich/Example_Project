// Collapse whitespace (line breaks, indentation, narrow spaces like &thinsp;)
// into a single normal space and remove it at both ends
export function normalizeWhitespace(text: string | null | undefined) {
    return (text ?? '').replace(/\s+/g, ' ').trim();
}
