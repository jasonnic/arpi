import type { Shipment, DisruptionScenario, FreightCorridor } from './types';

export const mockShipments: Shipment[] = [
  {
    id: 'SHP-001',
    origin: { name: 'Port of Los Angeles, CA', lat: 33.7292, lng: -118.2620 },
    destination: { name: 'Warehouse, Chicago, IL', lat: 41.8781, lng: -87.6298 },
    contents: 'Consumer Electronics',
    status: 'On Time',
  },
  {
    id: 'SHP-002',
    origin: { name: 'Port of Savannah, GA', lat: 32.0809, lng: -81.0912 },
    destination: { name: 'Distribution Center, New York, NY', lat: 40.7128, lng: -74.0060 },
    contents: 'Apparel & Textiles',
    status: 'On Time',
  },
  {
    id: 'SHP-003',
    origin: { name: 'Manufacturing Plant, Detroit, MI', lat: 42.3314, lng: -83.0458 },
    destination: { name: 'Assembly Line, Austin, TX', lat: 30.2672, lng: -97.7431 },
    contents: 'Automotive Parts',
    status: 'On Time',
  },
   {
    id: 'SHP-004',
    origin: { name: 'Port of New Orleans, LA', lat: 29.9511, lng: -90.0715 },
    destination: { name: 'Processing Facility, Memphis, TN', lat: 35.1495, lng: -90.0490 },
    contents: 'Agricultural Goods',
    status: 'On Time',
  },
];

export const mockFreightCorridors: FreightCorridor[] = [
    { id: "I-95", name: "I-95 Corridor (East Coast)", path: [{ lat: 25.7617, lng: -80.1918 }, { lat: 40.7128, lng: -74.0060 }, { lat: 45.0000, lng: -69.0000 }] },
    { id: "I-5", name: "I-5 Corridor (West Coast)", path: [{ lat: 32.7157, lng: -117.1611 }, { lat: 34.0522, lng: -118.2437 }, { lat: 47.6062, lng: -122.3321 }] },
    { id: "I-90", name: "I-90 Corridor (North)", path: [{ lat: 47.6062, lng: -122.3321 }, { lat: 41.8781, lng: -87.6298 }, { lat: 42.3601, lng: -71.0589 }] },
    { id: "I-10", name: "I-10 Corridor (South)", path: [{ lat: 33.7292, lng: -118.2620 }, { lat: 30.2672, lng: -97.7431 }, { lat: 29.9511, lng: -90.0715 }, { lat: 30.4383, lng: -84.2807 }] },
];

export const disruptionScenarios: DisruptionScenario[] = [
  {
    value: 'hurricane',
    label: 'Hurricane',
    mockInput: {
      weatherData: "A Category 4 hurricane is projected to make landfall on the Gulf Coast near New Orleans, LA, in the next 36 hours. Expect widespread flooding, high winds, and road closures.",
      trafficData: "Major highways I-10 and I-12 are experiencing heavy outbound traffic as evacuations begin. Congestion is expected to worsen.",
      portCongestionData: "The Port of New Orleans is operating at reduced capacity and will close to all vessel traffic in 24 hours.",
      infrastructureHealthData: "Bridges and overpasses in the coastal region are at high risk of damage from storm surge and high winds."
    }
  },
  {
    value: 'wildfire',
    label: 'Wildfire',
     mockInput: {
      weatherData: "Hot, dry, and windy conditions have led to a large wildfire in Southern California, spreading rapidly towards major transportation routes.",
      trafficData: "Interstate 5 is closed in both directions near the Tejon Pass. Heavy traffic is being diverted to smaller state highways, causing significant delays.",
      portCongestionData: "No direct impact on ports, but ground transportation to and from the Port of Los Angeles is severely hampered.",
      infrastructureHealthData: "Power lines and communication towers are threatened by the fire, potentially causing wider-scale infrastructure outages."
    }
  },
  {
    value: 'blizzard',
    label: 'Blizzard',
    mockInput: {
      weatherData: "A major blizzard is forecast for the Midwest, centered on Chicago, IL. Expect 18-24 inches of snow and whiteout conditions over the next 48 hours.",
      trafficData: "All major interstates including I-90, I-94, and I-80 are becoming impassable. Travel is not advised. O'Hare and Midway airports have canceled all flights.",
      portCongestionData: "N/A for this region, but rail and trucking hubs are ceasing operations.",
      infrastructureHealthData: "Risk of power outages due to heavy snow and high winds."
    }
  }
];
