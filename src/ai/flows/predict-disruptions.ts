// src/ai/flows/predict-disruptions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting supply chain disruptions.
 *
 * - predictDisruptions - A function that predicts potential supply chain disruptions.
 * - PredictDisruptionsInput - The input type for the predictDisruptions function.
 * - PredictDisruptionsOutput - The return type for the predictDisruptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDisruptionsInputSchema = z.object({
  weatherData: z.string().describe('Real-time weather data, including forecasts.'),
  trafficData: z.string().describe('Real-time traffic data, including congestion reports.'),
  portCongestionData: z.string().describe('Real-time port congestion data.'),
  infrastructureHealthData: z.string().describe('Real-time infrastructure health data (e.g., bridge status).'),
});
export type PredictDisruptionsInput = z.infer<typeof PredictDisruptionsInputSchema>;

const PredictDisruptionsOutputSchema = z.object({
  disruptions: z
    .array(
      z.object({
        type: z.string().describe('The type of disruption (e.g., weather, congestion).'),
        location: z.string().describe('The general location of the disruption (e.g. New Orleans, LA).'),
        startTime: z.string().describe('The predicted start time of the disruption.'),
        endTime: z.string().describe('The predicted end time of the disruption.'),
        severity: z.string().describe('The severity of the disruption (e.g., low, medium, high).'),
        affectedShipments: z
          .array(
            z.object({
              shipmentId: z.string().describe('The ID of the affected shipment.'),
              location: z.string().describe("The specific latitude,longitude of the affected port or shipment's origin (e.g. 29.9511,-90.0715)."),
            })
          )
          .describe('List of affected shipments and their specific locations.'),
        alternativeRoutes: z.array(
          z.object({
            route: z.string().describe('Alternative route description.'),
            estimatedTimeSavings: z.number().describe('Estimated time savings in hours.'),
            estimatedCostSavings: z.number().describe('Estimated cost savings in USD.'),
            estimatedCo2Reduction: z.number().describe('Estimated CO2 reduction in kg.'),
          })
        ),
      })
    )
    .describe('A list of predicted supply chain disruptions.'),
});
export type PredictDisruptionsOutput = z.infer<typeof PredictDisruptionsOutputSchema>;

export async function predictDisruptions(input: PredictDisruptionsInput): Promise<PredictDisruptionsOutput> {
  return predictDisruptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDisruptionsPrompt',
  input: {schema: PredictDisruptionsInputSchema},
  output: {schema: PredictDisruptionsOutputSchema},
  prompt: `You are an AI expert in supply chain disruption prediction.
  Given the following data, predict potential supply chain disruptions in the next 12-48 hours.
  Provide alternative routes for affected shipments with estimated time, cost, and CO2 savings.

  When a shipment is affected, you MUST provide its specific location as a latitude,longitude string.
  For example, if a hurricane impacts the Port of New Orleans and affects shipment SHP-004 originating there, the location for that affected shipment should be "29.9511,-90.0715".

  Weather Data: {{{weatherData}}}
  Traffic Data: {{{trafficData}}}
  Port Congestion Data: {{{portCongestionData}}}
  Infrastructure Health Data: {{{infrastructureHealthData}}}

  Format your response as a JSON array of disruptions, including type, location, start time, end time, severity, affected shipments and alternative routes.
  `,
});

const predictDisruptionsFlow = ai.defineFlow(
  {
    name: 'predictDisruptionsFlow',
    inputSchema: PredictDisruptionsInputSchema,
    outputSchema: PredictDisruptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
