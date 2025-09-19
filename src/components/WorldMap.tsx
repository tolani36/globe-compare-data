import React, { useEffect, useRef, useState } from 'react';
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

const WorldMap: React.FC<WorldMapProps> = ({ onCountrySelect, selectedCountry }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON<any> | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,cca3,population,area,capital,region,subregion,languages,currencies,flag,flags,latlng'
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCountries(data as Country[]);
          return;
        }
        throw new Error('Invalid countries payload');
      } catch (error) {
        // Fallback to GitHub dataset
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
          })) as Country[];
          setCountries(mapped);
        } catch (err) {
          console.error('Error fetching countries:', err);
          setCountries([]);
        }
      }
    };

    fetchCountries();
  }, []);

  // Initialize Leaflet map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Load GeoJSON and wire interactions
  useEffect(() => {
    if (!mapRef.current) return;

    // If an existing layer exists, remove it before adding a new one
    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
      geoLayerRef.current = null;
    }

    const fetchGeo = async () => {
      try {
        // Use Natural Earth 1:50m admin boundaries (solid & reliable)
        const res = await fetch(
          'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geo = await res.json();

        const layer = L.geoJSON(geo, {
          style: (feature: any) => getCountryStyle(feature, selectedCountry),
          onEachFeature: (feature: any, layer: L.Layer) => {
            layer.on('mouseover', (e: any) => {
              const target = e.target as L.Path;
              target.setStyle({ weight: 2, color: '#1d4ed8', fillOpacity: 0.7 });
              if (!(target as any).bringToFront) return;
              (target as any).bringToFront();
            });
            layer.on('mouseout', (e: any) => {
              const target = e.target as L.Path;
              target.setStyle(getCountryStyle(feature, selectedCountry) as any);
            });
            layer.on('click', () => {
              const iso3 =
                feature.properties?.ISO_A3 ||
                feature.properties?.ADM0_A3 ||
                feature.properties?.ISO_A3_EH ||
                feature.properties?.ADM0_A3_US;

              let matched: Country | undefined;

              if (iso3 && countries.length > 0) {
                matched = countries.find((c) => c.cca3?.toUpperCase() === String(iso3).toUpperCase());
              }

              if (!matched) {
                const countryName =
                  feature.properties?.NAME ||
                  feature.properties?.ADMIN ||
                  feature.properties?.NAME_EN ||
                  feature.properties?.name;

                if (countryName && countries.length > 0) {
                  matched = countries.find((c) =>
                    [c.name.common, c.name.official]
                      .filter(Boolean)
                      .some((n) =>
                        n.toLowerCase() === String(countryName).toLowerCase() ||
                        String(countryName).toLowerCase().includes(n.toLowerCase()) ||
                        n.toLowerCase().includes(String(countryName).toLowerCase())
                      )
                  );
                }
              }

              if (matched) {
                onCountrySelect(matched);
                if (matched.latlng) {
                  mapRef.current?.setView([matched.latlng[0], matched.latlng[1]], 5);
                }
              }
            });
          },
        });

        layer.addTo(mapRef.current!);
        geoLayerRef.current = layer;
      } catch (err) {
        console.error('Error fetching GeoJSON:', err);
      }
    };

    fetchGeo();
  }, [countries, selectedCountry]);

  // Update view when selectedCountry changes
  useEffect(() => {
    if (selectedCountry?.latlng && mapRef.current) {
      mapRef.current.setView([selectedCountry.latlng[0], selectedCountry.latlng[1]], 5);
    }
  }, [selectedCountry]);

  return (
    <div className="flex-1 relative">
      <div ref={mapContainerRef} className="absolute inset-0 rounded-lg" />
      {selectedCountry && (
        <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-soft max-w-xs z-[1000]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="font-semibold text-sm">{selectedCountry.name.common}</span>
          </div>
          <p className="text-xs text-muted-foreground">Click for detailed information</p>
        </div>
      )}
    </div>
  );
};

function getCountryStyle(feature: any, selectedCountry: Country | null) {
  const fname =
    feature?.properties?.NAME ||
    feature?.properties?.ADMIN ||
    feature?.properties?.NAME_EN ||
    feature?.properties?.name;

  const isSelected = !!(
    selectedCountry &&
    fname &&
    [selectedCountry.name.common, selectedCountry.name.official]
      .filter(Boolean)
      .some((n) => n.toLowerCase() === String(fname).toLowerCase())
  );

  return {
    fillColor: isSelected ? '#3b82f6' : '#e2e8f0',
    weight: isSelected ? 1.5 : 1,
    opacity: 1,
    color: isSelected ? '#1d4ed8' : '#94a3b8',
    fillOpacity: isSelected ? 0.65 : 0.5,
  } as L.PathOptions;
}

export default WorldMap;
