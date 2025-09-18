import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

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

interface SearchBarProps {
  countries: Country[];
  onCountrySelect: (country: Country) => void;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ countries, onCountrySelect, onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0 && Array.isArray(countries)) {
      const filtered = countries
        .filter(country => 
          country.name.common.toLowerCase().includes(query.toLowerCase()) ||
          country.name.official.toLowerCase().includes(query.toLowerCase()) ||
          country.region.toLowerCase().includes(query.toLowerCase()) ||
          (country.capital && country.capital.some(cap => 
            cap.toLowerCase().includes(query.toLowerCase())
          ))
        )
        .slice(0, 8);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    onSearch(query);
  }, [query, countries, onSearch]);

  const handleSelect = (country: Country) => {
    setQuery(country.name.common);
    setShowSuggestions(false);
    onCountrySelect(country);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search countries, capitals, or regions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          onFocus={() => query && setShowSuggestions(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-card mt-1 z-50 max-h-80 overflow-y-auto">
          {suggestions.map((country) => (
            <button
              key={country.cca3}
              onClick={() => handleSelect(country)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors duration-200 flex items-center gap-3 border-b border-border last:border-b-0"
            >
              <span className="text-xl">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{country.name.common}</p>
                <p className="text-xs text-muted-foreground">
                  {country.region}
                  {country.capital && ` • ${country.capital[0]}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;