import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  TrendingUp, 
  Languages,
  Trophy,
  Medal,
  Award
} from 'lucide-react';
import AnalyticsDataService, { CountryRanking } from '@/services/analyticsDataService';

interface LanguageData {
  language: string;
  speakers: number;
  countries: string[];
}

const RankingsList: React.FC = () => {
  const [populationRankings, setPopulationRankings] = useState<CountryRanking[]>([]);
  const [gdpRankings, setGdpRankings] = useState<CountryRanking[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const [population, gdp, languages] = await Promise.all([
          AnalyticsDataService.fetchTopPopulatedCountries(),
          AnalyticsDataService.fetchTopGDPCountries(),
          AnalyticsDataService.fetchTopLanguages()
        ]);

        setPopulationRankings(population);
        setGdpRankings(gdp);
        setLanguageData(languages);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    if (num >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    } else if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    return `$${num.toLocaleString()}`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-orange-500" />;
      default: return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const RankingItem: React.FC<{ item: CountryRanking; index: number; formatter: (value: number) => string }> = ({ item, index, formatter }) => (
    <div className="group flex items-center justify-between p-4 rounded-xl bg-card hover:bg-muted/20 transition-all duration-300 border border-border shadow-sm hover:shadow-soft">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 w-8 flex items-center justify-center">
          {getRankIcon(index)}
        </div>
        {item.flag && (
          <div className="text-2xl flex-shrink-0">{item.flag}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
            {item.country}
          </p>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{item.code}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">
        <Badge variant="secondary" className="font-mono font-semibold text-sm px-3 py-1.5 whitespace-nowrap">
          {formatter(item.value)}
        </Badge>
      </div>
    </div>
  );

  const LanguageItem: React.FC<{ item: LanguageData; index: number }> = ({ item, index }) => (
    <div className="group flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-card to-card/50 hover:from-muted/30 hover:to-muted/10 transition-all duration-300 border border-border/50 shadow-card hover:shadow-soft">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {getRankIcon(index)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">{item.language}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Primary in: {item.countries.slice(0, 2).join(', ')}{item.countries.length > 2 ? ` +${item.countries.length - 2} more` : ''}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Badge variant="outline" className="font-mono font-bold text-sm px-3 py-1 bg-gradient-primary text-primary-foreground border-primary/20">
          {formatNumber(item.speakers)}
        </Badge>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-border/30">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Global Rankings</CardTitle>
            <p className="text-sm text-muted-foreground">Top countries by key indicators (2025 data)</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="population" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
            <TabsTrigger value="population" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Population</span>
              <span className="sm:hidden">Pop</span>
            </TabsTrigger>
            <TabsTrigger value="gdp" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all">
              <TrendingUp className="h-4 w-4" />
              GDP
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Languages</span>
              <span className="sm:hidden">Lang</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="population" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-chart-secondary" />
                <h3 className="text-lg font-semibold">Top 10 Most Populated Countries</h3>
              </div>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {populationRankings.map((item, index) => (
                    <RankingItem 
                      key={item.code} 
                      item={item} 
                      index={index} 
                      formatter={formatNumber}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gdp" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-chart-primary" />
                <h3 className="text-lg font-semibold">Top 10 Richest Countries by GDP</h3>
              </div>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {gdpRankings.map((item, index) => (
                    <RankingItem 
                      key={item.code} 
                      item={item} 
                      index={index} 
                      formatter={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="languages" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Languages className="h-5 w-5 text-chart-accent" />
                <h3 className="text-lg font-semibold">Most Spoken Languages Globally</h3>
              </div>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {languageData.map((item, index) => (
                    <LanguageItem 
                      key={item.language} 
                      item={item} 
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RankingsList;