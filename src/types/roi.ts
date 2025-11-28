
export interface ROIRegion {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  polygonCoordinates: Array<{ lat: number; lng: number }>;
  roiPercentage: number;
  projectedRevenue: string;
  projectedCost: number;
  netProfit: number;
  timeline: string;
  executiveSummary: string;
  details: string;

  // Granular data for the sidebar accordion
  marketSizeAndDensity: string;
  demographicProfile: string;
  projectedDemand: string;
  deploymentComplexity: string;
  laborAndResourceCosts: string;
  incumbentAnalysis: string;
  competitivePricing: string;
  permittingAndRegulation: string;
  esgImpactScore: string;

  // The full markdown report for the dialog view
  detailed_report: string;
  deepResearchReportUrl: string;
}

export interface ROIReport {
  city: string;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  executive_summary: string;
  regions: ROIRegion[];
}

// This type is no longer fetched directly but is useful for reference
// on the structure of GeoJSON data.
export interface GeoJSONFeature {
  type: "Feature";
  properties: {
    id: string;
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: "MultiPolygon" | "Polygon";
    coordinates: number[][][] | number[][][][];
  };
}
