// This file calculates optimal rerouting strategies considering cost, time and sustainability.

'use server';

/**
 * @fileOverview Calculates optimal rerouting strategies for freight based on predicted disruptions.
 *
 * - calculateOptimalRerouting - A function that calculates optimal rerouting strategies.
 * - CalculateOptimalReroutingInput - The input type for the calculateOptimalRerouting function.
 * - CalculateOptimalReroutingOutput - The return type for the calculateOptimalRerouting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateOptimalReroutingInputSchema = z.object({
  shipmentDetails: z.string().describe('Details of the shipment, including origin, destination, and contents.'),
  disruptionForecast: z.string().describe('Forecasted supply chain disruptions, including location, type, and severity.'),
  constraints: z.object({
    cost: z.number().describe('The relative importance of cost (0-100).'),
    time: z.number().describe('The relative importance of time (0-100).'),
    sustainability: z.number().describe('The relative importance of sustainability (0-100).'),
  }).describe('Constraints for the rerouting calculation.'),
});
export type CalculateOptimalReroutingInput = z.infer<typeof CalculateOptimalReroutingInputSchema>;

const CalculateOptimalReroutingOutputSchema = z.object({
  optimalRoute: z.string().describe('A description of the optimal route, including waypoints and transportation modes.'),
  estimatedCost: z.number().describe('The estimated cost of the optimal route.'),
  estimatedTime: z.number().describe('The estimated time of the optimal route.'),
  estimatedCO2Emissions: z.number().describe('The estimated CO2 emissions of the optimal route.'),
  alternatives: z.array(z.string()).describe('A summary of alternative routes considered, and the reason they were not selected.'),
});
export type CalculateOptimalReroutingOutput = z.infer<typeof CalculateOptimalReroutingOutputSchema>;

export async function calculateOptimalRerouting(input: CalculateOptimalReroutingInput): Promise<CalculateOptimalReroutingOutput> {
  return calculateOptimalReroutingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateOptimalReroutingPrompt',
  input: {schema: CalculateOptimalReroutingInputSchema},
  output: {schema: CalculateOptimalReroutingOutputSchema},
  prompt: `You are an expert logistics planner tasked with rerouting a shipment given a disruption.

  Shipment Details: {{{shipmentDetails}}}
  Disruption Forecast: {{{disruptionForecast}}}

  Considering the following constraints:
  Cost Importance: {{{constraints.cost}}}
  Time Importance: {{{constraints.time}}}
  Sustainability Importance: {{{constraints.sustainability}}}

  Calculate the optimal route, taking into account cost, time, and sustainability.  Provide a detailed description of the optimal route, including waypoints and transportation modes. Also provide the estimated cost, time, and CO2 emissions for the route.

  Also, summarize alternative routes considered, and the reason they were not selected.
  `,
});

const calculateOptimalReroutingFlow = ai.defineFlow(
  {
    name: 'calculateOptimalReroutingFlow',
    inputSchema: CalculateOptimalReroutingInputSchema,
    outputSchema: CalculateOptimalReroutingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
