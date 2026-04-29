/**
 * slugify.ts
 * Converts text to URL-safe slugs.
 * Used for generating human-readable URLs with IDs.
 */

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

/**
 * Creates a classroom slug from its data.
 * Format: {id}-{subject-name}-{section-name}
 * Example: 1-mathematics-ichigo
 */
export const classRoomSlug = (id: number, subjectName: string, sectionName: string): string => {
  return `${id}-${slugify(subjectName)}-${slugify(sectionName)}`
}

/**
 * Extracts the numeric ID from a slug.
 * Example: "1-mathematics-ichigo" → 1
 */
export const extractIdFromSlug = (slug: string): number => {
  return parseInt(slug.split('-')[0])
}