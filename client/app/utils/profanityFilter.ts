// Profanity filter utility
// Replaces curse words and inappropriate language with asterisks

const profanityList = [
  // Common curse words
  'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'bastard', 'crap',
  'dick', 'cock', 'pussy', 'whore', 'slut', 'piss', 'asshole',
  // Variants and leetspeak
  'f*ck', 'sh*t', 'b*tch', 'a$$', 'd*mn', 'h*ll', 'b@stard',
  'fck', 'fuk', 'shyt', 'biatch', 'azz',
  // Add more as needed
]

/**
 * Filter profanity from text by replacing with asterisks
 * Preserves the first letter for context
 * @param text - The text to filter
 * @returns Filtered text with profanity replaced
 */
export function filterProfanity(text: string): string {
  if (!text) return text

  let filteredText = text

  profanityList.forEach((word) => {
    // Create regex that matches the word with word boundaries (case-insensitive)
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    
    // Replace with first letter + asterisks
    filteredText = filteredText.replace(regex, (match) => {
      return match.charAt(0) + '*'.repeat(match.length - 1)
    })
  })

  return filteredText
}

/**
 * Check if text contains profanity
 * @param text - The text to check
 * @returns true if profanity is detected
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false

  const lowerText = text.toLowerCase()
  return profanityList.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lowerText)
  })
}

/**
 * Get the number of profane words in text
 * @param text - The text to analyze
 * @returns Count of profane words
 */
export function countProfanity(text: string): number {
  if (!text) return 0

  let count = 0
  const lowerText = text.toLowerCase()

  profanityList.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) {
      count += matches.length
    }
  })

  return count
}
