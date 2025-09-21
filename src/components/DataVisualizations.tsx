import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  BarChart3,
  Activity,
  Church
} from 'lucide-react';
import AnalyticsDataService, { PopulationGrowthData } from '@/services/analyticsDataService';

interface ReligionData {
  religion: string;
  adherents: number;
  percentage: number;
}

interface LanguageChartData {
  language: string;
  speakers: number;
}

const DataVisualizations: React.FC = () => {
  const [populationGrowthData, setPopulationGrowthData] = useState<PopulationGrowthData[]>([]);
  const [religionData, setReligionData] = useState<ReligionData[]>([]);
  const [languageData, setLanguageData] = useState<LanguageChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [populationGrowth, religions, languages] = await Promise.all([
          AnalyticsDataService.fetchPopulationGrowthData(['USA', 'CHN', 'IND', 'BRA', 'RUS']),
          AnalyticsDataService.fetchReligionDistribution(),
          AnalyticsDataService.fetchTopLanguages()
        ]);

        setPopulationGrowthData(populationGrowth);
        setReligionData(religions);
        setLanguageData(languages.slice(0, 8).map(lang => ({
          language: lang.language,
          speakers: lang.speakers
        })));
      } catch (error) {
        console.error('Failed to fetch visualization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform population growth data for line chart
  const transformedPopulationData = React.useMemo(() => {
    if (!populationGrowthData.length) return [];

    const allYears = new Set<number>();
    populationGrowthData.forEach(country => {
      country.data.forEach(point => allYears.add(point.year));
    });

    const sortedYears = Array.from(allYears).sort();

    return sortedYears.map(year => {
      const point: any = { year };
      populationGrowthData.forEach(country => {
        const dataPoint = country.data.find(d => d.year === year);
        if (dataPoint) {
          // Use abbreviated country names for better chart readability
          const countryName = country.country === 'United States' ? 'USA' : 
                            country.country === 'Russian Federation' ? 'Russia' : 
                            country.country;
          point[countryName] = dataPoint.population;
        }
      });
      return point;
    }).filter(point => Object.keys(point).length > 1);
  }, [populationGrowthData]);

  // Color schemes
  const lineColors = ['hsl(var(--chart-primary))', 'hsl(var(--chart-secondary))', 'hsl(var(--chart-accent))', 'hsl(var(--chart-muted))', '#8884d8'];
  const pieColors = [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-secondary))',
    'hsl(var(--chart-accent))',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#8dd1e1'
  ];

  const formatPopulation = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return value.toLocaleString();
  };

  const formatSpeakers = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    return value.toLocaleString();
  };

  const LoadingSkeleton = () => (
    <div className="h-80 w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );

  return (
    <Card className="w-full border-0 shadow-card bg-gradient-subtle">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          📊 Data Visualizations
        </CardTitle>
        <p className="text-sm text-muted-foreground">Interactive charts showcasing global trends and statistics</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="population" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
            <TabsTrigger value="population" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Population Growth</span>
              <span className="sm:hidden">Pop</span>
            </TabsTrigger>
            <TabsTrigger value="religion" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Religion</span>
              <span className="sm:hidden">Rel</span>
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Languages</span>
              <span className="sm:hidden">Lang</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="population" className="mt-6">
            <Card className="bg-gradient-subtle border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-secondary" />
                  Population Growth Over Time (2010-2023)
                </CardTitle>
                <p className="text-sm text-muted-foreground">Population trends for major world economies</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={transformedPopulationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="year" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={formatPopulation}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--card-foreground))'
                          }}
                          formatter={(value: number) => [formatPopulation(value), '']}
                        />
                        <Legend />
                        {populationGrowthData.map((country, index) => {
                          const countryName = country.country === 'United States' ? 'USA' : 
                                            country.country === 'Russian Federation' ? 'Russia' : 
                                            country.country;
                          return (
                            <Line
                              key={country.country}
                              type="monotone"
                              dataKey={countryName}
                              stroke={lineColors[index % lineColors.length]}
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name={countryName}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="religion" className="mt-6">
            <Card className="bg-gradient-subtle border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Church className="h-5 w-5 text-chart-accent" />
                  Global Religion Distribution
                </CardTitle>
                <p className="text-sm text-muted-foreground">World population by religious affiliation</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={religionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          innerRadius={40}
                          paddingAngle={2}
                          dataKey="adherents"
                        >
                          {religionData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`hsl(${197 + (index * 30)}, ${70 - index * 5}%, ${50 + index * 5}%)`} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name, props: any) => [
                            `${formatPopulation(value)} people (${props.payload.percentage}%)`, 
                            'Adherents'
                          ]} 
                          labelFormatter={(label) => `Religion: ${label}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--card-foreground))'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <Card className="bg-gradient-subtle border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-chart-primary" />
                  Most Spoken Languages Worldwide
                </CardTitle>
                <p className="text-sm text-muted-foreground">Global language speakers by total count</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={languageData.slice(0, 8)} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        layout="horizontal"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          type="number"
                          tickFormatter={formatSpeakers}
                          fontSize={12}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis 
                          type="category"
                          dataKey="language" 
                          width={100}
                          fontSize={12}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatSpeakers(value), 'Speakers']}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="speakers" 
                          fill="hsl(var(--chart-primary))"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataVisualizations;