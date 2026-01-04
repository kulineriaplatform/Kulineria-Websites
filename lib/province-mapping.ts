/**
 * Mapping antara nama province asli (user input) dengan format database
 * Membantu user menemukan kuliner meski mereka mengetik dengan berbagai variasi nama
 */

export const provinceMapping: Record<string, string[]> = {
  // Format database -> nama yang mungkin dicari user
  "jawa-barat": ["jawa barat", "jabar", "bandung"],
  "jawa-tengah": ["jawa tengah", "jateng", "semarang", "solo", "yogyakarta", "pekalongan"],
  "jawa-timur": ["jawa timur", "jatim", "surabaya", "malang", "gresik", "lamongan"],
  "sumatra-utara": ["sumatra utara", "sumatera utara", "sumut", "medan"],
  "sumatra-selatan": ["sumatra selatan", "sumatera selatan", "sumsell", "palembang"],
  "sumatra-barat": ["sumatra barat", "sumatera barat", "sumbara", "padang"],
  bali: ["bali", "denpasar", "ubud", "sanur", "seminyak"],
  "sulawesi-utara": ["sulawesi utara", "sulut", "manado", "tomohon", "bitung"],
  "sulawesi-selatan": ["sulawesi selatan", "sulsel", "makassar", "palopo", "kendari"],
  "sulawesi-tengah": ["sulawesi tengah", "sulteng", "palu"],
  "sulawesi-tenggara": ["sulawesi tenggara", "sultra", "kendari"],
  "kalimantan-barat": ["kalimantan barat", "kalbar", "pontianak"],
  "kalimantan-tengah": ["kalimantan tengah", "kalteng", "palangkaraya"],
  "kalimantan-selatan": ["kalimantan selatan", "kalsel", "banjarmasin"],
  "kalimantan-timur": ["kalimantan timur", "kaltim", "samarinda"],
  "kalimantan-utara": ["kalimantan utara", "kaltara", "tarakan"],
  "nusa-tenggara-barat": ["nusa tenggara barat", "ntb", "mataram", "lombok"],
  "nusa-tenggara-timur": ["nusa tenggara timur", "ntt", "kupang"],
  "papua": ["papua", "jayapura"],
  "papua-barat": ["papua barat", "papbar", "manokwari"],
  "riau": ["riau", "pekanbaru"],
  "jambi": ["jambi", "jambi city"],
  "bengkulu": ["bengkulu", "bengkulu city"],
  "lampung": ["lampung", "bandar lampung"],
  "kepulauan-riau": ["kepulauan riau", "kepri", "batam", "tanjung pinang"],
  "dki-jakarta": ["dki jakarta", "jakarta", "kota jakarta"],
  "di-yogyakarta": ["di yogyakarta", "yogyakarta", "yogya"],
  "banten": ["banten", "serang", "tangerang"]
};

/**
 * Cari province format database dari user input
 * @param query - Input pencarian user
 * @returns Format database province atau null jika tidak ditemukan
 */
export function findProvinceFromQuery(query: string): string | null {
  const normalized = query.toLowerCase().trim();

  // Cek apakah query sudah dalam format database
  if (Object.keys(provinceMapping).includes(normalized)) {
    return normalized;
  }

  // Cari dalam mapping
  for (const [dbFormat, aliases] of Object.entries(provinceMapping)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return dbFormat;
    }
  }

  return null;
}

/**
 * Get semua valid province database formats
 */
export function getValidProvinces(): string[] {
  return Object.keys(provinceMapping);
}

/**
 * Check if string matches any province (flexible matching)
 */
export function matchesProvince(query: string, province: string): boolean {
  const normalized = query.toLowerCase().trim();
  const dbFormat = findProvinceFromQuery(normalized);
  
  if (!dbFormat) return false;
  
  // Check exact match with database format
  return province.toLowerCase() === dbFormat.toLowerCase();
}
