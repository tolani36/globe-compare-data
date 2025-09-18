import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CountryLayer: React.FC<{ 
  countries: Country[]; 
  onCountrySelect: (country: Country) => void;
  selectedCountry: Country | null;
}> = ({ countries, onCountrySelect, selectedCountry }) => {
  const [geoData, setGeoData] = useState<any>(null);
  
  useEffect(() => {
    // Fetch world countries GeoJSON data
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data))
      .catch(error => console.error('Error fetching GeoJSON:', error));
  }, []);

  const getCountryStyle = (feature: any) => {
    const isSelected = selectedCountry?.name.common === feature.properties.NAME;
    return {
      fillColor: isSelected ? '#3b82f6' : '#e2e8f0',
      weight: isSelected ? 2 : 1,
      opacity: 1,
      color: isSelected ? '#1d4ed8' : '#94a3b8',
      fillOpacity: isSelected ? 0.7 : 0.5
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#1d4ed8',
          fillOpacity: 0.7
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(getCountryStyle(feature));
      },
      click: () => {
        const countryName = feature.properties.NAME;
        const matchedCountry = countries.find(c => 
          c.name.common.toLowerCase().includes(countryName.toLowerCase()) ||
          countryName.toLowerCase().includes(c.name.common.toLowerCase()) ||
          c.name.official.toLowerCase().includes(countryName.toLowerCase())
        );
        
        if (matchedCountry) {
          onCountrySelect(matchedCountry);
        }
      }
    });
  };

  if (!geoData) return null;

  return (
    <GeoJSON 
      data={geoData} 
      style={getCountryStyle}
      onEachFeature={onEachFeature}
    />
  );
};

const MapEvents: React.FC<{ selectedCountry: Country | null }> = ({ selectedCountry }) => {
  const map = useMapEvents({});

  useEffect(() => {
    if (selectedCountry && selectedCountry.latlng) {
      map.setView([selectedCountry.latlng[0], selectedCountry.latlng[1]], 5);
    }
  }, [selectedCountry, map]);

  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({ onCountrySelect, selectedCountry }) => {
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

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="absolute inset-0 rounded-lg"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CountryLayer 
          countries={countries}
          onCountrySelect={onCountrySelect}
          selectedCountry={selectedCountry}
        />
        <MapEvents selectedCountry={selectedCountry} />
      </MapContainer>
      
      {selectedCountry && (
        <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-soft max-w-xs z-[1000]">
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