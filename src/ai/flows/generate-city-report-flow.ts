
'use server';
/**
 * @fileOverview A Genkit flow to generate a fictional, detailed ROI report for a given city.
 *
 * - generateCityReport - Generates an ROI report for a city.
 * - GenerateCityReportInput - Input schema for the flow.
 * - ROIReport (as output schema) - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Zod schemas for structured output, mirroring src/types/roi.ts
const ROIRegionSchema = z.object({
  id: z.string().describe("A unique identifier for the region, e.g., 'district-downtown'."),
  name: z.string().describe("The common name of the investment region/district."),
  coordinates: z.object({
    lat: z.number().describe("Latitude of the region's center."),
    lng: z.number().describe("Longitude of the region's center."),
  }),
  polygonCoordinates: z.array(z.object({ lat: z.number(), lng: z.number() }))
    .describe("An array of {lat, lng} objects defining the vertices of the region's polygon boundary. Ensure coordinates form a valid, non-self-intersecting polygon."),
  roiPercentage: z.number().describe("Projected Return on Investment percentage (e.g., 12.5 for 12.5%)."),
  projectedRevenue: z.string().describe("Projected revenue range, e.g., '$5M - $7M' or '€3M - €5M' (use appropriate currency for the city)."),
  projectedCost: z.number().describe("Total projected cost for the investment in USD."),
  netProfit: z.number().describe("Projected net profit in USD."),
  timeline: z.string().describe("Estimated project timeline, e.g., '18-24 months'."),
  executiveSummary: z.string().describe("A brief (1-2 sentences) executive summary of the investment opportunity in this region."),
  details: z.string().describe("More detailed description of the investment region, including opportunities, potential risks, and key characteristics (2-4 sentences)."),
  marketSizeAndDensity: z.string().describe("Analysis of the market size and population density."),
  demographicProfile: z.string().describe("Description of the typical demographic profile of the area."),
  projectedDemand: z.string().describe("Analysis of the projected demand for services in this region."),
  deploymentComplexity: z.string().describe("Evaluation of the complexity of deploying infrastructure or services."),
  laborAndResourceCosts: z.string().describe("Summary of labor and resource costs in the area."),
  incumbentAnalysis: z.string().describe("Analysis of existing competitors or incumbent providers."),
  competitivePricing: z.string().describe("Information on the competitive pricing landscape."),
  permittingAndRegulation: z.string().describe("Overview of the local permitting and regulatory environment."),
  esgImpactScore: z.string().describe("An Environmental, Social, and Governance (ESG) impact score and brief justification."),
  detailed_report: z.string().describe("A full, detailed report in Markdown format. It should contain several sections with titles prefixed by '##' and subsections with '###'. Include all the generated data points in a well-structured narrative."),
  deepResearchReportUrl: z.string().describe("A fictional URL to a detailed research report for this region. This URL should be constructed by taking the input city name, converting it to lowercase, replacing spaces with hyphens (to form a slug), and then using the format: https://example.com/report/{city-slug}/{region-id}."),
});

const ROIReportSchema = z.object({
  city: z.string().describe("The name of the city for which the report is generated."),
  mapCenter: z.object({
    lat: z.number().describe("Latitude for the map's center point for this city."),
    lng: z.number().describe("Longitude for the map's center point for this city."),
  }),
  mapZoom: z.number().describe("Appropriate map zoom level for viewing the city and its regions (typically 10-13)."),
  regions: z.array(ROIRegionSchema).describe("An array of 3 to 5 distinct investment regions within the city.")
});

export type ROIReport = z.infer<typeof ROIReportSchema>;

const GenerateCityReportInputSchema = z.object({
  cityName: z.string().describe('The name of the city for which to generate an ROI report.'),
});
export type GenerateCityReportInput = z.infer<typeof GenerateCityReportInputSchema>;

export async function generateCityReport(input: GenerateCityReportInput): Promise<ROIReport> {
  return generateCityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCityReportPrompt',
  input: {schema: GenerateCityReportInputSchema},
  output: {schema: ROIReportSchema},
  prompt: `You are an expert financial analyst and urban planner creating a fictional investment ROI report for {{{cityName}}}.
The report must be comprehensive, detailed, and adhere strictly to the output JSON schema.

Generate the following, ensuring all fields are populated with plausible, realistic data:
1.  'city': The name of the city, '{{{cityName}}}'.
2.  'mapCenter': Plausible geographic coordinates for the center of {{{cityName}}}.
3.  'mapZoom': An appropriate integer map zoom level (10-13).
4.  'regions': An array of 3 to 5 distinct, fictional (but plausible-sounding) investment regions. For each region:
    *   'id': A unique slug-like ID (e.g., 'tech-park', 'waterfront-redevelopment').
    *   'name': A descriptive name (e.g., 'Tech Park District', 'Historic Waterfront').
    *   'coordinates': Plausible geographic coordinates for this region's center point.
    *   'polygonCoordinates': An array of 4 to 6 {lat, lng} objects defining a simple polygon boundary.
    *   'roiPercentage': A realistic projected ROI percentage (e.g., 8.5 for 8.5%).
    *   'projectedRevenue': A plausible revenue range (e.g., '$5M - $7M', adapt currency to city).
    *   'projectedCost': A plausible total cost in USD (e.g., 2500000 for $2.5M).
    *   'netProfit': Calculate and provide the net profit in USD.
    *   'timeline': An estimated project timeline (e.g., '18-24 months').
    *   'executiveSummary': A brief (1-2 sentences) summary.
    *   'details': A more detailed paragraph (2-4 sentences) covering opportunities and risks.
    *   **Detailed Sections**: Populate ALL of the following fields with 1-2 sentence analyses: 'marketSizeAndDensity', 'demographicProfile', 'projectedDemand', 'deploymentComplexity', 'laborAndResourceCosts', 'incumbentAnalysis', 'competitivePricing', 'permittingAndRegulation', 'esgImpactScore'.
    *   'deepResearchReportUrl': Construct a fictional URL: https://example.com/report/{city-slug}/{region-id}.
    *   'detailed_report': Generate a full markdown report. This report should synthesize all the generated data points into a cohesive narrative. Use '##' for main section titles (like '## Investment Summary') and '###' for subsection titles (like '### Market Size & Density'). Ensure it is well-formatted and comprehensive.

Ensure all text is professional and all data is varied and interesting. Do not use placeholder text. Provide your response strictly in the specified JSON format.
`,
});

const generateCityReportFlow = ai.defineFlow(
  {
    name: 'generateCityReportFlow',
    inputSchema: GenerateCityReportInputSchema,
    outputSchema: ROIReportSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a report for the city.");
    }
    // Safeguard: ensure the city name in the output matches the input.
    output.city = input.cityName;
    return output;
  }
);
