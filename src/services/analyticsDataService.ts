// Service to fetch analytics data from various APIs
interface WorldBankIndicator {
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
  value: number | null;
  date: string;
}

interface LanguageData {
  language: string;
  speakers: number;
  countries: string[];
}

interface ReligionData {
  religion: string;
  adherents: number;
  percentage: number;
}

export interface CountryRanking {
  country: string;
  code: string;
  value: number;
  flag?: string;
}

export interface PopulationGrowthData {
  country: string;
  data: { year: number; population: number }[];
}

class AnalyticsDataService {
  private static cache = new Map<string, any>();
  private static readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  // World Bank API endpoints
  private static readonly WORLD_BANK_BASE = 'https://api.worldbank.org/v2';
  
  // Population indicator (SP.POP.TOTL) and GDP (NY.GDP.MKTP.CD)
  private static readonly POPULATION_INDICATOR = 'SP.POP.TOTL';
  private static readonly GDP_INDICATOR = 'NY.GDP.MKTP.CD';

  private static getCacheKey(key: string): string {
    return `analytics_${key}`;
  }

  private static isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  static async fetchTopPopulatedCountries(): Promise<CountryRanking[]> {
    const cacheKey = this.getCacheKey('top_populated');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Use REST Countries API for more accurate and up-to-date data
      const response = await fetch('https://restcountries.com/v3.1/all');
      
      if (!response.ok) throw new Error('Failed to fetch population data');
      
      const data = await response.json();
      
      if (!Array.isArray(data)) throw new Error('Invalid population data format');

      // Convert to ranking format and sort
      const rankings: CountryRanking[] = data
        .filter(country => country.population && country.cca3)
        .map(country => ({
          country: country.name.common,
          code: country.cca3,
          value: country.population,
          flag: country.flag
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Cache the result
      this.cache.set(cacheKey, {
        data: rankings,
        timestamp: Date.now()
      });

      return rankings;
    } catch (error) {
      console.error('Failed to fetch population rankings:', error);
      
      // Fallback data with 2025 estimates
      return [
        { country: 'India', code: 'IND', value: 1441719852, flag: '🇮🇳' },
        { country: 'China', code: 'CHN', value: 1425178782, flag: '🇨🇳' },
        { country: 'United States', code: 'USA', value: 341814420, flag: '🇺🇸' },
        { country: 'Indonesia', code: 'IDN', value: 279798049, flag: '🇮🇩' },
        { country: 'Pakistan', code: 'PAK', value: 240485658, flag: '🇵🇰' },
        { country: 'Nigeria', code: 'NGA', value: 232679478, flag: '🇳🇬' },
        { country: 'Brazil', code: 'BRA', value: 217637297, flag: '🇧🇷' },
        { country: 'Bangladesh', code: 'BGD', value: 174701211, flag: '🇧🇩' },
        { country: 'Russia', code: 'RUS', value: 144820423, flag: '🇷🇺' },
        { country: 'Mexico', code: 'MEX', value: 130861007, flag: '🇲🇽' },
      ];
    }
  }

  static async fetchTopGDPCountries(): Promise<CountryRanking[]> {
    const cacheKey = this.getCacheKey('top_gdp');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Get latest GDP data from World Bank (2024 data)
      const response = await fetch(
        `${this.WORLD_BANK_BASE}/country/all/indicator/${this.GDP_INDICATOR}?format=json&date=2022:2024&per_page=300`
      );
      
      if (!response.ok) throw new Error('Failed to fetch GDP data');
      
      const [metadata, data] = await response.json();
      
      if (!Array.isArray(data)) throw new Error('Invalid GDP data format');

      // Get the most recent data for each country
      const countryData = new Map<string, WorldBankIndicator>();
      data.forEach((item: WorldBankIndicator) => {
        if (item.value && item.country.id.length === 3) {
          const existing = countryData.get(item.country.id);
          if (!existing || item.date > existing.date) {
            countryData.set(item.country.id, item);
          }
        }
      });

      // Convert to ranking format and sort
      const rankings: CountryRanking[] = Array.from(countryData.values())
        .map(item => ({
          country: item.country.value,
          code: item.country.id,
          value: item.value || 0,
          flag: this.getFlagEmoji(item.country.id)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Cache the result
      this.cache.set(cacheKey, {
        data: rankings,
        timestamp: Date.now()
      });

      return rankings;
    } catch (error) {
      console.error('Failed to fetch GDP rankings:', error);
      
      // Fallback data with 2024-2025 estimates (in USD)
      return [
        { country: 'United States', code: 'USA', value: 28781000000000, flag: '🇺🇸' },
        { country: 'China', code: 'CHN', value: 18532000000000, flag: '🇨🇳' },
        { country: 'Germany', code: 'DEU', value: 4591000000000, flag: '🇩🇪' },
        { country: 'Japan', code: 'JPN', value: 4110000000000, flag: '🇯🇵' },
        { country: 'India', code: 'IND', value: 4051000000000, flag: '🇮🇳' },
        { country: 'United Kingdom', code: 'GBR', value: 3495000000000, flag: '🇬🇧' },
        { country: 'France', code: 'FRA', value: 3130000000000, flag: '🇫🇷' },
        { country: 'Italy', code: 'ITA', value: 2255000000000, flag: '🇮🇹' },
        { country: 'Brazil', code: 'BRA', value: 2173000000000, flag: '🇧🇷' },
        { country: 'Canada', code: 'CAN', value: 2117000000000, flag: '🇨🇦' },
      ];
    }
  }

  private static getFlagEmoji(countryCode: string): string {
    // Convert country code to flag emoji
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  static async fetchTopLanguages(): Promise<LanguageData[]> {
    const cacheKey = this.getCacheKey('top_languages');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Since there's no reliable free API for language speaker counts,
      // we'll use curated data based on multiple sources
      const languages: LanguageData[] = [
        { language: 'English', speakers: 1500000000, countries: ['USA', 'UK', 'Canada', 'Australia', 'India'] },
        { language: 'Mandarin Chinese', speakers: 1118000000, countries: ['China', 'Taiwan', 'Singapore'] },
        { language: 'Hindi', speakers: 602000000, countries: ['India'] },
        { language: 'Spanish', speakers: 559000000, countries: ['Spain', 'Mexico', 'Argentina', 'Colombia'] },
        { language: 'Arabic', speakers: 422000000, countries: ['Saudi Arabia', 'Egypt', 'UAE', 'Morocco'] },
        { language: 'French', speakers: 280000000, countries: ['France', 'Canada', 'Belgium', 'Switzerland'] },
        { language: 'Bengali', speakers: 268000000, countries: ['Bangladesh', 'India'] },
        { language: 'Portuguese', speakers: 258000000, countries: ['Brazil', 'Portugal', 'Angola'] },
        { language: 'Russian', speakers: 258000000, countries: ['Russia', 'Belarus', 'Kazakhstan'] },
        { language: 'Japanese', speakers: 125000000, countries: ['Japan'] },
      ].sort((a, b) => b.speakers - a.speakers);

      // Cache the result
      this.cache.set(cacheKey, {
        data: languages,
        timestamp: Date.now()
      });

      return languages;
    } catch (error) {
      console.error('Failed to fetch language data:', error);
      return [];
    }
  }

  static async fetchPopulationGrowthData(countries: string[] = ['USA', 'CHN', 'IND', 'BRA', 'RUS']): Promise<PopulationGrowthData[]> {
    const cacheKey = this.getCacheKey(`population_growth_${countries.join('_')}`);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    try {
      const promises = countries.map(async (countryCode) => {
        const response = await fetch(
          `${this.WORLD_BANK_BASE}/country/${countryCode}/indicator/${this.POPULATION_INDICATOR}?format=json&date=2010:2023`
        );
        
        if (!response.ok) throw new Error(`Failed to fetch data for ${countryCode}`);
        
        const [metadata, data] = await response.json();
        
        if (!Array.isArray(data)) return null;

        const populationData = data
          .filter((item: WorldBankIndicator) => item.value !== null)
          .map((item: WorldBankIndicator) => ({
            year: parseInt(item.date),
            population: item.value || 0
          }))
          .sort((a, b) => a.year - b.year);

        return {
          country: data[0]?.country?.value || countryCode,
          data: populationData
        };
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(Boolean) as PopulationGrowthData[];

      // Cache the result
      this.cache.set(cacheKey, {
        data: validResults,
        timestamp: Date.now()
      });

      return validResults;
    } catch (error) {
      console.error('Failed to fetch population growth data:', error);
      return [];
    }
  }

  static async fetchReligionDistribution(): Promise<ReligionData[]> {
    const cacheKey = this.getCacheKey('religion_distribution');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Based on Pew Research and other reliable sources
      const religions: ReligionData[] = [
        { religion: 'Christianity', adherents: 2400000000, percentage: 31.1 },
        { religion: 'Islam', adherents: 1800000000, percentage: 24.1 },
        { religion: 'Hinduism', adherents: 1200000000, percentage: 15.1 },
        { religion: 'Buddhism', adherents: 500000000, percentage: 6.9 },
        { religion: 'Folk Religions', adherents: 400000000, percentage: 5.7 },
        { religion: 'Judaism', adherents: 14000000, percentage: 0.2 },
        { religion: 'Other Religions', adherents: 58000000, percentage: 0.8 },
        { religion: 'Unaffiliated', adherents: 1200000000, percentage: 16.3 },
      ];

      // Cache the result
      this.cache.set(cacheKey, {
        data: religions,
        timestamp: Date.now()
      });

      return religions;
    } catch (error) {
      console.error('Failed to fetch religion data:', error);
      return [];
    }
  }
}

export default AnalyticsDataService;