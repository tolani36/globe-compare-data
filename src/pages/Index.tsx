import React, { useState, useEffect } from 'react';
import WorldMap from '@/components/WorldMap';
import CountryDetails from '@/components/CountryDetails';
import SearchBar from '@/components/SearchBar';
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
}

const Index = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
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
      <div className="flex flex-1 overflow-hidden">
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
