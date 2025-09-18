import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

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
}

interface WorldMapProps {
  onCountrySelect: (country: Country) => void;
  selectedCountry: Country | null;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountrySelect, selectedCountry }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenEntered, setTokenEntered] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch countries data
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

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setTokenEntered(true);
      initializeMap(mapboxToken.trim());
    }
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 2,
      center: [0, 20],
      projection: 'naturalEarth',
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      // Add hover effect for countries
      map.current?.on('mouseenter', 'country-fills', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current?.on('mouseleave', 'country-fills', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      // Handle country clicks
      map.current?.on('click', async (e) => {
        const features = map.current?.queryRenderedFeatures(e.point);
        if (features && features.length > 0) {
          const countryFeature = features.find(f => f.source === 'composite' && f.sourceLayer === 'country_label');
          
          if (countryFeature && countryFeature.properties) {
            const countryName = countryFeature.properties.name_en;
            const matchedCountry = countries.find(c => 
              c.name.common.toLowerCase() === countryName.toLowerCase() ||
              c.name.official.toLowerCase() === countryName.toLowerCase()
            );
            
            if (matchedCountry) {
              onCountrySelect(matchedCountry);
              
              // Fly to country
              if (matchedCountry.latlng) {
                map.current?.flyTo({
                  center: [matchedCountry.latlng[1], matchedCountry.latlng[0]],
                  zoom: 5,
                  duration: 2000
                });
              }
            }
          }
        }
      });
    });
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!tokenEntered) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-subtle p-8">
        <div className="bg-card rounded-lg shadow-card p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Mapbox</h3>
            <p className="text-muted-foreground text-sm">
              Enter your Mapbox public token to view the interactive world map.
              Get your token at{' '}
              <a 
                href="https://mapbox.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleTokenSubmit}
              className="w-full"
              disabled={!mapboxToken.trim()}
            >
              Connect Map
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Your token is only stored in your browser and never sent to our servers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {selectedCountry && (
        <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-soft max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="font-semibold text-sm">{selectedCountry.name.common}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Click for detailed information
          </p>
        </div>
      )}
    </div>
  );
};

export default WorldMap;