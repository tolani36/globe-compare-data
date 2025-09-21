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
    <div className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border border-border/50 shadow-sm">
      <div className="flex items-center gap-3">
        {getRankIcon(index)}
        <div>
          <p className="font-semibold text-sm">{item.country}</p>
          <p className="text-xs text-muted-foreground font-mono">{item.code}</p>
        </div>
      </div>
      <Badge variant="secondary" className="font-mono font-semibold">
        {formatter(item.value)}
      </Badge>
    </div>
  );

  const LanguageItem: React.FC<{ item: LanguageData; index: number }> = ({ item, index }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors border border-border/50 shadow-sm">
      <div className="flex items-center gap-3">
        {getRankIcon(index)}
        <div>
          <p className="font-semibold text-sm">{item.language}</p>
          <p className="text-xs text-muted-foreground">
            Primary in: {item.countries.slice(0, 2).join(', ')}{item.countries.length > 2 ? ` +${item.countries.length - 2} more` : ''}
          </p>
        </div>
      </div>
      <Badge variant="secondary" className="font-mono font-semibold">
        {formatNumber(item.speakers)}
      </Badge>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Global Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="population" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="population" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Population
            </TabsTrigger>
            <TabsTrigger value="gdp" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              GDP
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Languages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="population" className="mt-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Top 10 Most Populated Countries
              </h3>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-2">
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
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Top 10 Richest Countries by GDP
              </h3>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-2">
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
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Most Spoken Languages Globally
              </h3>
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-2">
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