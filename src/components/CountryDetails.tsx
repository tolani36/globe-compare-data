import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MapPin, 
  Globe, 
  Languages, 
  DollarSign, 
  Flag,
  Building,
  TrendingUp,
  Crown,
  Calendar,
  Church
} from 'lucide-react';

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
  gdp?: number;
  // Additional data from external sources
  religion?: string;
  president?: string;
  independence?: string;
}

interface CountryDetailsProps {
  country: Country | null;
}

const CountryDetails: React.FC<CountryDetailsProps> = ({ country }) => {
  if (!country) {
    return (
      <div className="w-full md:w-96 bg-gradient-subtle p-8 flex items-center justify-center">
        <div className="text-center">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Explore the World</h3>
          <p className="text-muted-foreground text-sm">
            Click on any country on the map to view detailed information about its population, economy, and culture.
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num?: number | null): string => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPopulation = (pop?: number | null): string => {
    if (typeof pop !== 'number' || isNaN(pop)) return 'N/A';
    if (pop >= 1_000_000_000) {
      return `${(pop / 1_000_000_000).toFixed(1)}B`;
    } else if (pop >= 1_000_000) {
      return `${(pop / 1_000_000).toFixed(1)}M`;
    } else if (pop >= 1_000) {
      return `${(pop / 1_000).toFixed(1)}K`;
    }
    return pop.toString();
  };

  const languages = country.languages ? Object.values(country.languages) : [];
  const currencies = country.currencies ? Object.values(country.currencies) : [];

  return (
    <div className="w-full md:w-96 bg-gradient-subtle border-l border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header with Flag on Top */}
        <div className="text-center space-y-3">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-soft overflow-hidden">
            <img 
              src={`https://flagcdn.com/w320/${country.cca3.toLowerCase()}.png`}
              alt={`Flag of ${country.name.common}`}
              className="w-32 h-24 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {country.name.common}
            </h1>
            <p className="text-muted-foreground text-sm">{country.name.official}</p>
            <Badge variant="secondary" className="mt-2">
              {country.cca3}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Region</p>
              <p className="text-muted-foreground">{country.region}</p>
            </div>
            {country.subregion && (
              <div>
                <p className="text-sm font-medium">Subregion</p>
                <p className="text-muted-foreground">{country.subregion}</p>
              </div>
            )}
            {country.capital && country.capital.length > 0 && (
              <div>
                <p className="text-sm font-medium">Capital</p>
                <p className="text-muted-foreground">{country.capital.join(', ')}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Coordinates</p>
              <p className="text-muted-foreground font-mono text-xs">
                {Array.isArray(country.latlng) && country.latlng.length === 2 &&
                typeof country.latlng[0] === 'number' && typeof country.latlng[1] === 'number'
                  ? `${country.latlng[0].toFixed(4)}°, ${country.latlng[1].toFixed(4)}°`
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-secondary" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Population</p>
              <div className="text-right">
                <p className="font-semibold">{formatPopulation(country.population)}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(country.population)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Area</p>
              <div className="text-right">
                <p className="font-semibold">{formatNumber(country.area)} km²</p>
                <p className="text-xs text-muted-foreground">
                  {typeof country.population === 'number' && typeof country.area === 'number' && country.area > 0
                    ? `${Math.round(country.population / country.area)} people/km²`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        {languages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-5 w-5 text-chart-accent" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {languages.map((language, index) => (
                  <Badge key={index} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Currencies */}
        {currencies.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-chart-primary" />
                Currency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currencies.map((currency, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{currency.name}</span>
                    <Badge variant="secondary">{currency.symbol}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Religion */}
        {country.religion && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Church className="h-5 w-5 text-chart-accent" />
                Most Practiced Religion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{country.religion}</p>
            </CardContent>
          </Card>
        )}

        {/* Government/President */}
        {country.president && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-chart-primary" />
                Current Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{country.president}</p>
            </CardContent>
          </Card>
        )}

        {/* Independence */}
        {country.independence && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-chart-secondary" />
                Independence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{country.independence}</p>
            </CardContent>
          </Card>
        )}

        {/* Flag */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Flag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={country.flags?.svg || country.flags?.png} 
                alt={`Flag of ${country.name?.common || 'country flag'}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CountryDetails;