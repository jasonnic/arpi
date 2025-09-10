import type { PredictDisruptionsInput } from '@/ai/flows/predict-disruptions';

export type LatLng = {
  lat: number;
  lng: number;
};

export type Location = {
  name: string;
} & LatLng;

export type Shipment = {
  id: string;
  origin: Location;
  destination: Location;
  contents: string;
  status: 'On Time' | 'At Risk' | 'Delayed';
};

export type DisruptionScenario = {
  value: string;
  label: string;
  mockInput: PredictDisruptionsInput;
};

export type FreightCorridor = {
  id: string;
  name: string;
  path: LatLng[];
};
