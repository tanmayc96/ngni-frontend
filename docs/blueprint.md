# **App Name**: ROI Vision

## Core Features:

- Interactive ROI Map: Display a map of the selected city with sub-areas highlighted.
- ROI Data Visualization: Overlay ROI data (percentage and/or revenue) onto the map, using color-coding to visualize investment opportunities.
- Detailed Opportunity View: Enable users to click on a sub-area indicator to view detailed investment information in a side tab, including projected revenue, timeline, and the executive summary. Clicking should also make it open the 'deep_research_report_url' in another tab.
- AI-Powered Summary: AI-powered chat widget that lets you talk with the input JSON data. For now assume that the input data is loaded as a file from local storage. The LLM will act as a summarization tool. Make sure to indicate a confidence score for this summary.
- Executive Summary: Implement a clear and concise executive summary display.

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2) to evoke trust and highlight opportunity.
- Background color: Light gray (#F0F2F5) to provide a clean, neutral backdrop.
- Accent color: Energetic orange (#FF9933) for call-to-action buttons and important details.
- Font pairing: 'Inter' (sans-serif) for body text and 'Space Grotesk' (sans-serif) for headlines; for a modern and professional look.
- Use simple, geometric icons to represent different data points and functionalities.
- Implement a clean and intuitive layout with a focus on data visualization and user interaction. The main app screen should be the map of the city from the input JSON data. The map should show some indicators above the regions that are mentioned in the report. Those indicators should be clickable. When an indicator is clicked, a tab should appear on the right hand side of the screen with detailed information from the input JSON data about this specific region.