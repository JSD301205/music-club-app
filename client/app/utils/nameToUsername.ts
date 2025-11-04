/**
 * Maps team member names to community profile usernames
 * This is used to link team cards to community profiles
 */

export const nameToUsernameMap: Record<string, string> = {
  // Admin/Core Members
  'Shriyaaa': 'Shriya',
  'Shriya Y': 'Shriya',
  'Gokul Krishna Balaji': 'gokulkrishna1686',
  'Harith Yerragolam': 'Harith',
  'Harith Y': 'Harith',
  'Sharon David J': 'JSD',
  'DJ Sharon': 'JSD',
  'David J Sharon': 'JSD',
  'Priyansu Samanta': 'priyansu_1o',
  'Nivedh Biju': 'piano_man',
  'bhadresh': 'bln674',
  'Bhadresh L': 'bln674',
  'Bhadresh': 'bln674',
  'Samuel Tom Joseph': 'eulestein',
  'Omkar Anand Iyer': 'marko',
  'Omkar': 'marko',
  'Martien David': 'martiendavid',
  'Dikshant': 'howdikshant',
  'Dikshant Ubale': 'howdikshant',
  'Anuj Mishra': 'bruhitsmeykme',
  'Aayushya Paswan': 'aayush',
  'Aayushya': 'aayush',
  'kshitij': 'hhoehunterr',
  'Kshitij': 'hhoehunterr',
  'Meera K': 'Meera',
  'Meera R': 'MeeraR',
  'Krishnasankar': 'Meera',
  'Grishmank Parate': 'grishmank_parate',
  'Sam Asder': 'samazsder',
  'Piyush Mishra': 'pengeon',
  'Piyush': 'pengeon',
  'Harini B': 'harini_b',
  'Harini': 'harini_b',
  'Tarun Mamillapalli': 'tarstar',
  'Tarun': 'tarstar',
  'Anmol': 'rajnish_mera_roommate_hai',
//   'Avula Varshini': 'varshini_1396',
//   'Varshini': 'varshini_1396',
  
  // Alumni
  'Abraham Lincoln': 'rajnish_mera_roommate_hai', // Default to the visible one if there are multiple
  
  // Additional common name variations
  'Yashas': '', // Need to add if profile exists
  'Rikitha Ravi': '', // Need to add if profile exists
};

/**
 * Get username from team member name
 * Returns null if no mapping exists or if the username is empty
 */
export function getUsernameFromName(name: string): string | null {
  // Direct match
  if (nameToUsernameMap[name]) {
    const username = nameToUsernameMap[name];
    return username.trim() === '' ? null : username;
  }

  // Try to find a case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(nameToUsernameMap)) {
    if (key.toLowerCase() === lowerName) {
      return value.trim() === '' ? null : value;
    }
  }

  // Try to match by partial name (first name or last name)
  const nameParts = name.split(' ');
  for (const [key, value] of Object.entries(nameToUsernameMap)) {
    const keyParts = key.split(' ');
    // Check if first name matches
    if (nameParts[0].toLowerCase() === keyParts[0].toLowerCase()) {
      return value.trim() === '' ? null : value;
    }
    // Check if last name matches (if both have last names)
    if (nameParts.length > 1 && keyParts.length > 1) {
      if (nameParts[nameParts.length - 1].toLowerCase() === keyParts[keyParts.length - 1].toLowerCase()) {
        return value.trim() === '' ? null : value;
      }
    }
  }

  return null;
}

/**
 * Check if a user profile is private (not visible in community)
 * This would typically check the database, but for now we'll use a simple check
 */
export async function isProfilePrivate(username: string): Promise<boolean> {
  // This function should query Supabase to check is_visible_in_community
  // For now, return false (assume public)
  // The actual implementation will be in the component using the Supabase client
  return false;
}
