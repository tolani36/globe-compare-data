// Service to fetch additional country data from multiple sources
interface AdditionalCountryData {
  religion?: string;
  president?: string;
  independence?: string;
}

interface FactbookData {
  Government?: {
    'Executive branch'?: {
      'chief of state'?: { text: string };
    };
    Independence?: { text: string };
  };
  'People and Society'?: {
    Religions?: { text: string };
  };
}

class CountryDataService {
  private static factbookCache = new Map<string, AdditionalCountryData>();
  
  // Mapping of country codes/names to factbook regions and files
  private static getFactbookPath(countryCode: string, countryName: string): string | null {
    const mappings: { [key: string]: string } = {
      // North America
      'US': 'north-america/us.json',
      'USA': 'north-america/us.json',
      'United States': 'north-america/us.json',
      'CA': 'north-america/ca.json',
      'Canada': 'north-america/ca.json',
      'MX': 'north-america/mx.json',
      'Mexico': 'north-america/mx.json',
      
      // Europe
      'FR': 'europe/fr.json',
      'France': 'europe/fr.json',
      'DE': 'europe/gm.json',
      'Germany': 'europe/gm.json',
      'UK': 'europe/uk.json',
      'GB': 'europe/uk.json',
      'United Kingdom': 'europe/uk.json',
      'IT': 'europe/it.json',
      'Italy': 'europe/it.json',
      'ES': 'europe/sp.json',
      'Spain': 'europe/sp.json',
      'RU': 'asia/rs.json',
      'Russia': 'asia/rs.json',
      
      // Asia
      'CN': 'asia/ch.json',
      'China': 'asia/ch.json',
      'JP': 'asia/ja.json',
      'Japan': 'asia/ja.json',
      'IN': 'asia/in.json',
      'India': 'asia/in.json',
      'KR': 'asia/ks.json',
      'South Korea': 'asia/ks.json',
      
      // Africa
      'NG': 'africa/ni.json',
      'Nigeria': 'africa/ni.json',
      'EG': 'africa/eg.json',
      'Egypt': 'africa/eg.json',
      'ZA': 'africa/sf.json',
      'South Africa': 'africa/sf.json',
      
      // South America
      'BR': 'south-america/br.json',
      'Brazil': 'south-america/br.json',
      'AR': 'south-america/ar.json',
      'Argentina': 'south-america/ar.json',
      
      // Oceania
      'AU': 'australia-oceania/as.json',
      'Australia': 'australia-oceania/as.json',
    };
    
    return mappings[countryCode] || mappings[countryName] || null;
  }

  static async fetchAdditionalData(countryCode: string, countryName: string): Promise<AdditionalCountryData> {
    // Check cache first
    const cacheKey = `${countryCode}-${countryName}`;
    if (this.factbookCache.has(cacheKey)) {
      return this.factbookCache.get(cacheKey)!;
    }

    const result: AdditionalCountryData = {};

    try {
      const factbookPath = this.getFactbookPath(countryCode, countryName);
      if (factbookPath) {
        const factbookUrl = `https://raw.githubusercontent.com/factbook/factbook.json/master/${factbookPath}`;
        console.log(`Fetching factbook data for ${countryName} from: ${factbookUrl}`);
        
        const response = await fetch(factbookUrl);
        if (response.ok) {
          const data: FactbookData = await response.json();
          
          // Extract religion data
          if (data['People and Society']?.Religions?.text) {
            result.religion = this.parseReligion(data['People and Society'].Religions.text);
          }
          
          // Extract president/head of state
          if (data.Government?.['Executive branch']?.['chief of state']?.text) {
            result.president = this.parsePresident(data.Government['Executive branch']['chief of state'].text);
          }
          
          // Extract independence date
          if (data.Government?.Independence?.text) {
            result.independence = this.parseIndependence(data.Government.Independence.text);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch additional data for ${countryName}:`, error);
    }

    // Cache the result
    this.factbookCache.set(cacheKey, result);
    return result;
  }

  private static parseReligion(religionText: string): string {
    // Extract the most prominent religion (usually the first one)
    const religions = religionText.split(',')[0].trim();
    // Remove percentages and extra info for cleaner display
    return religions.replace(/\s+\d+(\.\d+)?%.*$/, '').trim();
  }

  private static parsePresident(presidentText: string): string {
    // Clean up president name and remove extra details
    let president = presidentText
      .replace(/^(President|Prime Minister|Chief of State|Head of Government)\s+/i, '')
      .replace(/\s+\(since.*?\).*$/, '')
      .trim();
    
    // Handle special cases
    if (president.toLowerCase().includes('vacant') || president.toLowerCase().includes('acting')) {
      return 'Position Vacant/Acting';
    }
    
    return president || 'Not Available';
  }

  private static parseIndependence(independenceText: string): string {
    // Extract just the date part, remove explanatory text
    const match = independenceText.match(/(\d+\s+[A-Za-z]+\s+\d{4})/);
    if (match) {
      return match[1];
    }
    
    // Fallback to year extraction
    const yearMatch = independenceText.match(/\b(\d{4})\b/);
    if (yearMatch) {
      return yearMatch[1];
    }
    
    return independenceText.split('(')[0].trim() || 'Not Available';
  }
}

export default CountryDataService;