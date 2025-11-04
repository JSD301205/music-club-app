import { createClient } from '@/app/lib/supabase-client';

/**
 * Maps band member names to community profile usernames
 * This is used to link band member cards to community profiles
 * 
 * @deprecated This hardcoded map is being phased out in favor of database-driven mappings.
 * It serves as a fallback if database fetch fails.
 */
export const bandMemberNameToUsernameMap: Record<string, string> = {
  // Same as team members since many overlap
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
};

/**
 * Fetch all active band member username mappings from the database
 * Returns a map of band member names to usernames
 */
export async function fetchBandMemberUsernameMappings(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase
      .from('band_member_username_mappings')
      .select('band_member_name, username') as any)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching band member username mappings:', error);
      return bandMemberNameToUsernameMap; // Fallback to hardcoded map
    }

    // Convert array to map
    const mappings: Record<string, string> = {};
    data?.forEach((row: { band_member_name: string; username: string }) => {
      mappings[row.band_member_name] = row.username;
    });

    return mappings;
  } catch (err) {
    console.error('Failed to fetch band member username mappings:', err);
    return bandMemberNameToUsernameMap; // Fallback to hardcoded map
  }
}

/**
 * Get username from band member name using database mappings
 * Returns null if no mapping exists or if the username is empty
 * 
 * @param name - The band member name to look up
 * @param mappings - Optional pre-fetched mappings (for performance)
 */
export function getBandMemberUsernameFromName(name: string, mappings?: Record<string, string>): string | null {
  // Use provided mappings or fall back to hardcoded map
  const map = mappings || bandMemberNameToUsernameMap;
  
  // Direct match
  if (map[name]) {
    const username = map[name];
    return username.trim() === '' ? null : username;
  }

  // Try to find a case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(map)) {
    if (key.toLowerCase() === lowerName) {
      return value.trim() === '' ? null : value;
    }
  }

  // Try to match by partial name (first name or last name)
  const nameParts = name.split(' ');
  for (const [key, value] of Object.entries(map)) {
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
 * Get username from band member name (async version with database fetch)
 * This is the preferred method as it uses the database mappings
 * 
 * @param name - The band member name to look up
 */
export async function getBandMemberUsernameFromNameAsync(name: string): Promise<string | null> {
  const mappings = await fetchBandMemberUsernameMappings();
  return getBandMemberUsernameFromName(name, mappings);
}
