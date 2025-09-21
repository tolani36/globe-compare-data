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
  Activity
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Data Visualizations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="population" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="population" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Population Growth
            </TabsTrigger>
            <TabsTrigger value="religion" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Religion Distribution
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Language Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="population" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Population Growth Over Time (2010-2023)
              </h3>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transformedPopulationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="year" 
                        stroke="hsl(var(--foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--foreground))"
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
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
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
              <h3 className="text-sm font-semibold text-muted-foreground">
                Global Religion Distribution
              </h3>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={religionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ religion, percentage }) => percentage > 5 ? `${religion.length > 12 ? religion.substring(0, 12) + '...' : religion}` : ''}
                        outerRadius={100}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="adherents"
                        paddingAngle={2}
                      >
                        {religionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => {
                          const religionEntry = religionData.find(r => r.religion === value);
                          return religionEntry ? `${value} (${religionEntry.percentage}%)` : value;
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--card-foreground))'
                        }}
                        formatter={(value: number, name) => [
                          `${formatPopulation(value)} people (${religionData.find(r => r.adherents === value)?.percentage}%)`,
                          'Adherents'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Most Spoken Languages Worldwide
              </h3>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={languageData.slice().reverse()} 
                      layout="horizontal"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        type="number" 
                        stroke="hsl(var(--foreground))"
                        fontSize={12}
                        tickFormatter={formatSpeakers}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="language" 
                        stroke="hsl(var(--foreground))"
                        fontSize={11}
                        width={120}
                        interval={0}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--card-foreground))'
                        }}
                        formatter={(value: number) => [formatSpeakers(value), 'Speakers']}
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataVisualizations;