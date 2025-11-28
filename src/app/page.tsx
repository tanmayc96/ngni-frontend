
// src/app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { ROIReport, ROIRegion } from "@/types/roi";
import { MapView } from "@/components/map/map-view";
import { DetailsSidebar } from "@/components/details-sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Terminal, MapPin, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const AVAILABLE_CITIES = [
  { id: "berlin", name: "Berlin" },
  { id: "milan", name: "Milan" },
];

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<ROIRegion | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [selectedCityId, setSelectedCityId] = useState<string>(AVAILABLE_CITIES[0].id);
  const [cityReportData, setCityReportData] = useState<ROIReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null);
  }, []);

  const fetchCityData = useCallback(async (cityId: string) => {
    const cityName = AVAILABLE_CITIES.find(c => c.id === cityId)?.name;
    if (!cityName) {
      setError("Invalid city selected.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCityReportData(null);

    try {
      console.log(`Fetching data for ${cityName} from API...`);
      const response = await fetch(`/api/city-data/${cityId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const report: ROIReport = await response.json();
      setCityReportData(report);

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred while fetching data.";
      console.error("Error fetching city data:", message);
      setError(message);
      toast({
        variant: "destructive",
        title: "Data Loading Error",
        description: "There was a problem loading the city report. Please check the server console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchCityData(selectedCityId);
  }, [selectedCityId, fetchCityData]);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedRegion(null);
    setIsSidebarOpen(false);
  };

  const handleRegionClick = (region: ROIRegion) => {
    setSelectedRegion(region);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedRegion(null);
  };

  if (!isClient || !apiKey) {
     return (
      <div className="flex items-center justify-center h-screen w-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle className="font-headline">Configuration Error</AlertTitle>
          <AlertDescription>
            Google Maps API Key could not be loaded. Please ensure the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable is set correctly in your .env.local file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const currentCityName = AVAILABLE_CITIES.find(c => c.id === selectedCityId)?.name || "Selected City";

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative h-screen w-screen">
        <SidebarProvider>
          <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
            <Sidebar side="left" className="p-2 flex flex-col" collapsible="icon" variant="inset">
                <div className="p-2 flex justify-between items-center">
                    <h2 className="font-headline text-lg group-data-[collapsible=icon]:hidden">Ranked Regions</h2>
                    <SidebarTrigger />
                </div>
                <ScrollArea className="flex-1 -mx-2">
                    <SidebarContent className="p-2">
                        <SidebarMenu>
                            {(cityReportData?.regions || []).map((region, index) => (
                                <SidebarMenuItem key={region.id} asChild>
                                  <Card 
                                    className={`cursor-pointer transition-all ${selectedRegion?.id === region.id ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'}`}
                                    onClick={() => handleRegionClick(region)}
                                  >
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground truncate max-w-[150px]">{index + 1}. {region.name}</p>
                                                <p className="text-xs text-muted-foreground">Click to view details</p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <div className="flex items-center text-sm font-bold text-accent">
                                                  <TrendingUp className="w-4 h-4 mr-1" />
                                                  {region.roiPercentage.toFixed(1)}%
                                                </div>
                                                <p className="text-xs text-muted-foreground">ROI</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                  </Card>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                </ScrollArea>
            </Sidebar>

            <SidebarInset>
              <div className="relative h-full w-full">
                <Card className="absolute top-4 left-4 z-10 p-2">
                  <CardContent className="p-0 flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <Select value={selectedCityId} onValueChange={handleCityChange}>
                      <SelectTrigger className="w-[180px] font-medium border-0 focus:ring-0">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_CITIES.map(city => (
                          <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <div className="flex-grow h-full relative">
                  {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                      <p className="text-lg font-semibold text-foreground">
                          Loading data for {currentCityName}...
                      </p>
                      <p className="text-sm text-muted-foreground">This may take a moment.</p>
                    </div>
                  )}

                  {!isLoading && error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20 p-8 text-center">
                      <Card className="w-full max-w-md p-6">
                          <h2 className="font-headline text-xl text-destructive flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 mr-2"/> Error Loading Report
                          </h2>
                          <p className="text-card-foreground mt-4 mb-4">
                            Could not load data for {currentCityName}.
                          </p>
                          <Alert variant="destructive">
                              <AlertDescription className="text-xs text-left whitespace-pre-line">{error}</AlertDescription>
                          </Alert>
                      </Card>
                    </div>
                  )}
                  
                  {!isLoading && !error && cityReportData && (
                      <MapView
                        data={cityReportData}
                        onRegionClick={handleRegionClick}
                        selectedRegionId={selectedRegion?.id}
                      />
                  )}
                </div>
                
                {cityReportData && (
                  <DetailsSidebar
                    region={cityReportData.regions.find(r => r.id === selectedRegion?.id) || null}
                    isOpen={isSidebarOpen}
                    onClose={handleCloseSidebar}
                  />
                )}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </APIProvider>
  );
}
