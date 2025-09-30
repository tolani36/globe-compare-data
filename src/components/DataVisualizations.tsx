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
  Church,
  Users,
  Languages,
  Globe
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
  const COLORS = [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-secondary))',
    'hsl(var(--chart-accent))',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#8dd1e1'
  ];
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
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Data Visualizations</CardTitle>
            <p className="text-sm text-muted-foreground">Interactive charts showcasing global trends and statistics</p>
          </div>
        </div>
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-secondary" />
                <h3 className="text-lg font-semibold">Population Growth Over Time (2010-2023)</h3>
              </div>
              <p className="text-sm text-muted-foreground">Population trends for major world economies</p>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-96 w-full rounded-lg bg-card/50 p-4 border border-border">
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
            </div>
          </TabsContent>

          <TabsContent value="religion" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Church className="h-5 w-5 text-chart-accent" />
                <h3 className="text-lg font-semibold">Global Religion Distribution</h3>
              </div>
              <p className="text-sm text-muted-foreground">World population by religious affiliation</p>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-[500px] w-full rounded-lg bg-card/50 p-4 border border-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={religionData}
                        cx="50%"
                        cy="45%"
                        outerRadius={140}
                        innerRadius={50}
                        paddingAngle={2}
                        dataKey="adherents"
                        label={(entry) => `${entry.religion}: ${entry.percentage}%`}
                      >
                        {religionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={pieColors[index % pieColors.length]}
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
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-chart-primary" />
                <h3 className="text-lg font-semibold">Most Spoken Languages Worldwide</h3>
              </div>
              <p className="text-sm text-muted-foreground">Global language speakers by total count</p>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-[500px] w-full rounded-lg bg-card/50 p-4 border border-border">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={languageData.slice(0, 8)} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                        width={120}
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
                        radius={[0, 8, 8, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataVisualizations;