
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Firestore } from '@google-cloud/firestore';
import type { ROIReport, ROIRegion } from '@/types/roi';

// Helper function to calculate polygon centroid
const calculateCentroid = (coords: { lat: number; lng: number }[]) => {
  if (!coords || coords.length === 0) return { lat: 0, lng: 0 };
  let latSum = 0;
  let lngSum = 0;
  for (const coord of coords) {
    latSum += coord.lat;
    lngSum += coord.lng;
  }
  return { lat: latSum / coords.length, lng: lngSum / coords.length };
};

// Helper function to assemble the report from raw data
function assembleReport(geojsonDocData: any, reportDocData: any, cityName: string, cityId: string): ROIReport {
    const parsingErrors: string[] = [];

    if (!reportDocData || !reportDocData.ranked_opportunities || !Array.isArray(reportDocData.ranked_opportunities)) {
        throw new Error(`The report data for '${cityName}' is malformed. The document is missing the required 'ranked_opportunities' array.`);
    }
    
    let features;
    if (geojsonDocData.type === 'FeatureCollection' && Array.isArray(geojsonDocData.features)) {
      features = geojsonDocData.features;
    } else if (geojsonDocData.type === 'Feature') {
      features = [geojsonDocData];
    } else if (Array.isArray(geojsonDocData.features)) {
      features = geojsonDocData.features;
    } else {
      throw new Error(`The GeoJSON data for '${cityName}' is malformed. The document does not appear to be a valid GeoJSON Feature or FeatureCollection object.`);
    }

    const combinedRegions: ROIRegion[] = features.map((feature: any, index: number) => {
      const props = feature.properties || {}; // Safely access properties
      const regionId = props?.id || props?.name || props?.sub_area_name;

      if (!regionId) {
          parsingErrors.push(`Polygon at index ${index} is missing a usable identifier in its properties (checked for 'id', 'name', 'sub_area_name').`);
          return null;
      }
      
      const opportunity = reportDocData.ranked_opportunities.find((o: any) => o.sub_area_name.toLowerCase() === regionId.toLowerCase());
      if (!opportunity) {
        console.warn(`No report found for region ID: '${regionId}'. This polygon will not be displayed.`);
        return null;
      }

      let geometry;
      try {
        geometry = typeof feature.geometry === 'string'
          ? JSON.parse(feature.geometry)
          : feature.geometry;
      } catch (e) {
          parsingErrors.push(`Region '${regionId}': The 'geometry' field is a string but is not valid JSON.`);
          return null;
      }

      if (!geometry || !geometry.coordinates || !Array.isArray(geometry.coordinates)) {
        parsingErrors.push(`Region '${regionId}': The 'geometry' object is missing or has an invalid 'coordinates' property.`);
        return null;
      }

      let polygonCoordinates: { lat: number; lng: number }[];

      if (geometry.type === 'MultiPolygon') {
         if (!geometry.coordinates[0]?.[0]) {
             parsingErrors.push(`Region '${regionId}': The 'MultiPolygon' geometry data is structured incorrectly.`);
             return null;
         }
        polygonCoordinates = geometry.coordinates[0][0].map((coords: number[]) => ({
          lat: coords[1],
          lng: coords[0],
        }));
      } else if (geometry.type === 'Polygon') {
         if (!geometry.coordinates[0]) {
             parsingErrors.push(`Region '${regionId}': The 'Polygon' geometry data is structured incorrectly.`);
             return null;
         }
        polygonCoordinates = geometry.coordinates[0].map((coords: number[]) => ({
          lat: coords[1],
          lng: coords[0],
        }));
      } else {
        parsingErrors.push(`Region '${regionId}': Has an unsupported geometry type '${geometry.type}'. Expected 'Polygon' or 'MultiPolygon'.`);
        return null;
      }

      if (polygonCoordinates.some(p => typeof p.lat !== 'number' || typeof p.lng !== 'number' || isNaN(p.lat) || isNaN(p.lng))) {
          parsingErrors.push(`Region '${regionId}': Contains invalid or non-numeric coordinate values.`);
          return null;
      }
      
      const financials = opportunity.financials || {};
      const reportSections = opportunity.detailed_report.split('---');

      const getSectionContent = (title: string) => {
        const section = reportSections.find((s: string) => s.includes(`### ${title}`));
        return section ? section.split('\n').slice(1).join('\n').trim() : 'Not available';
      }

      return {
        id: regionId,
        name: opportunity.sub_area_name,
        coordinates: calculateCentroid(polygonCoordinates),
        polygonCoordinates: polygonCoordinates,
        roiPercentage: financials.estimated_roi_percentage || 0,
        projectedRevenue: `€${(financials.total_projected_revenue_usd || 0).toLocaleString()}`,
        projectedCost: financials.total_projected_cost_usd || 0,
        netProfit: financials.net_profit || 0,
        timeline: "24 Months",
        executiveSummary: reportDocData.executive_summary,
        details: getSectionContent('Investment Summary & ROI'),
        marketSizeAndDensity: getSectionContent('Market Size & Density'),
        demographicProfile: getSectionContent('Demographic Profile'),
        projectedDemand: getSectionContent('Projected Demand & Remote Work'),
        deploymentComplexity: getSectionContent('Deployment Complexity'),
        laborAndResourceCosts: getSectionContent('Labor & Resource Costs'),
        incumbentAnalysis: getSectionContent('Incumbent Provider Analysis'),
        competitivePricing: getSectionContent('Competitive Pricing'),
        permittingAndRegulation: getSectionContent('Permitting & Regulation'),
        esgImpactScore: getSectionContent('ESG Impact Score'),
        detailed_report: opportunity.detailed_report,
        deepResearchReportUrl: "",
      };
    }).filter((r: ROIRegion | null): r is ROIRegion => r !== null);


    if (parsingErrors.length > 0) {
      console.warn('Some regions could not be parsed:', parsingErrors);
    }
    
    if (features.length > 0 && combinedRegions.length === 0) {
      throw new Error(`Could not display any regions for ${cityName}. All polygon data was malformed or could not be matched with a report. Check server console for details.`);
    }

    combinedRegions.sort((a, b) => b.roiPercentage - a.roiPercentage);
    
    const mapConfig = cityId === 'milan' 
      ? { center: { lat: 45.4642, lng: 9.1900 }, zoom: 11 }
      : { center: { lat: 52.5200, lng: 13.4050 }, zoom: 10 };

    return {
      city: cityName,
      mapCenter: mapConfig.center,
      mapZoom: mapConfig.zoom,
      executive_summary: reportDocData.executive_summary,
      regions: combinedRegions,
    };
}


export async function GET(
  request: Request,
  { params }: { params: { cityId: string } }
) {
  const cityId = params.cityId;
  const AVAILABLE_CITIES = [
    { id: "berlin", name: "Berlin" },
    { id: "milan", name: "Milan" },
  ];
  const cityName = AVAILABLE_CITIES.find(c => c.id === cityId)?.name;

  if (!cityName) {
    return NextResponse.json({ error: 'Invalid city' }, { status: 404 });
  }

  try {
    // Try to read from local files first
    const dataDir = path.join(process.cwd(), 'data');
    const reportPath = path.join(dataDir, `${cityId}.report.json`);
    let geojsonPath = path.join(dataDir, `${cityId}.geojson`);
    let geojsonContent, reportContent;

    try {
        // Try reading .geojson first, then fall back to .json
        try {
            geojsonContent = await fs.readFile(geojsonPath, 'utf8');
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                geojsonPath = path.join(dataDir, `${cityId}.json`);
                geojsonContent = await fs.readFile(geojsonPath, 'utf8');
            } else {
                throw e; // Re-throw other errors
            }
        }
        reportContent = await fs.readFile(reportPath, 'utf8');
        
        console.log(`Fetching the data for ${cityName} from the local file`);
        
        const geojsonDocData = JSON.parse(geojsonContent);
        const reportDocData = JSON.parse(reportContent);

        const report = assembleReport(geojsonDocData, reportDocData, cityName, cityId);
        return NextResponse.json(report);

    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // If files don't exist, fall back to Firestore
            console.log(`Could not find local data. Fetching the data for ${cityName} from API`);
            
            const db = new Firestore({
                projectId: process.env.PROJECT_ID,
                databaseId: process.env.FIRESTORE_ID,
            });

            const geojsonDocRef = db.collection('geojson').doc(cityId);
            const reportDocRef = db.collection('report').doc(cityId);

            const [geojsonDocSnap, reportDocSnap] = await Promise.all([
                geojsonDocRef.get(),
                reportDocRef.get(),
            ]);

            if (!geojsonDocSnap.exists) {
                throw new Error(`Could not find GeoJSON data for ${cityName} in Firestore.`);
            }
            if (!reportDocSnap.exists) {
                throw new Error(`Could not find report data for ${cityName} in Firestore.`);
            }

            const geojsonDocData = geojsonDocSnap.data();
            const reportDocData = reportDocSnap.data();
            
            const report = assembleReport(geojsonDocData, reportDocData, cityName, cityId);
            return NextResponse.json(report);
        }
        // If it's another type of error (e.g., JSON parsing), let it be caught by the outer catch
        throw error;
    }
  } catch (error: any) {
    console.error(`Failed to get data for ${cityId}:`, error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
