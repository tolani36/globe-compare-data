import React, { useState, useEffect } from 'react';
import WorldMap from '@/components/WorldMap';
import CountryDetails from '@/components/CountryDetails';
import SearchBar from '@/components/SearchBar';
import CountryDataService from '@/services/countryDataService';
import { Globe, BarChart3 } from 'lucide-react';

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca3: string;
  population: number;
  area: number;
  capital?: string[];
  region: string;
  subregion?: string;
  languages?: { [key: string]: string };
  currencies?: { [key: string]: { name: string; symbol: string } };
  flag: string;
  flags: {
    png: string;
    svg: string;
  };
  latlng: [number, number];
  // Additional data from external sources
  religion?: string;
  president?: string;
  independence?: string;
}

const Index = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,cca3,population,area,capital,region,subregion,languages,currencies,flag,flags,latlng'
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCountries(data);
          return;
        }
        throw new Error('Invalid countries payload');
      } catch (error) {
        try {
          const res2 = await fetch(
            'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'
          );
          const data2 = await res2.json();
          const mapped = (Array.isArray(data2) ? data2 : []).map((c: any) => ({
            name: c.name,
            cca3: c.cca3,
            population: c.population,
            area: c.area,
            capital: c.capital,
            region: c.region,
            subregion: c.subregion,
            languages: c.languages,
            currencies: c.currencies,
            flag: c.flag,
            flags: c.flags,
            latlng: c.latlng,
          }));
          setCountries(mapped);
        } catch (err) {
          console.error('Error fetching countries:', err);
          setCountries([]);
        }
      }
    };

    fetchCountries();
  }, []);

  const handleCountrySelect = async (country: Country) => {
    console.log('Country selected:', country.name.common);
    
    // Fetch additional data from external sources
    try {
      const additionalData = await CountryDataService.fetchAdditionalData(
        country.cca3, 
        country.name.common
      );
      
      // Merge additional data with country object
      const enrichedCountry = {
        ...country,
        ...additionalData
      };
      
      setSelectedCountry(enrichedCountry);
    } catch (error) {
      console.error('Failed to fetch additional country data:', error);
      // Fall back to basic country data
      setSelectedCountry(country);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-subtle border-b border-border shadow-soft">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    World Explorer
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Discover countries, cultures, and data
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>{countries.length} countries loaded</span>
            </div>
          </div>
          
          <div className="w-full max-w-2xl">
            <SearchBar 
              countries={countries}
              onCountrySelect={handleCountrySelect}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <WorldMap 
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry}
        />
        <CountryDetails country={selectedCountry} />
      </div>
    </div>
  );
};

export default Index;
