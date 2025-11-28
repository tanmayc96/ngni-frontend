'use server';
/**
 * @fileOverview A Genkit flow to chat about a city ROI report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatWithReportInputSchema = z.object({
  question: z.string().describe('The user question about the report.'),
  report: z.any().describe('The JSON object for a specific sub-area/region report.'),
});
export type ChatWithReportInput = z.infer<typeof ChatWithReportInputSchema>;

export async function chatWithReport(input: ChatWithReportInput): Promise<string> {
  return await chatWithReportFlow(input);
}

const chatWithReportFlow = ai.defineFlow(
  {
    name: 'chatWithReportFlow',
    inputSchema: ChatWithReportInputSchema,
    outputSchema: z.string(),
  },
  async (flowInput) => {
    // Create a summary of the report to avoid sending too much data in the prompt.
    // Omit very large fields like the full markdown report and polygon coordinates.
    const { detailed_report, polygonCoordinates, ...reportSummary } = flowInput.report;

    const prompt = `You are a helpful investment analyst assistant. A user is asking a question about a specific investment region report.
    Answer the user's question based ONLY on the data provided in the following JSON report for that region.
    Be concise and clear in your answer. If the report does not contain the answer, say so.
    Do not make up information.

    USER QUESTION:
    ${flowInput.question}

    REGION REPORT DATA:
    ${JSON.stringify(reportSummary, null, 2)}
    `;

    try {
      const response = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.5-pro',
      });
    
      const text = response.text;

      if (!text) {
        // Log the full response for debugging if text is missing
        console.error('Chatbot Error: AI response was empty. Full response object:', JSON.stringify(response, null, 2));
        return "I'm sorry, I couldn't generate a response. The AI returned an empty message.";
      }

      return text;

    } catch (e) {
      // Log the specific error
      console.error('Chatbot Error: An error occurred during AI generation.', e);
      // Provide a more informative error message
      return "I'm sorry, I couldn't generate a response due to a server error. Please check the server console for details.";
    }
  }
);
