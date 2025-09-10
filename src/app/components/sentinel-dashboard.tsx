'use client';

import { useState } from 'react';
import { SidebarControls } from './sidebar-controls';
import { MapView } from './map-view';
import { RerouteDialog } from './reroute-dialog';
import { mockShipments } from '@/app/lib/mock-data';
import type { Shipment } from '@/app/lib/types';
import type { PredictDisruptionsOutput } from '@/ai/flows/predict-disruptions';
import { predictDisruptions } from '@/ai/flows/predict-disruptions';
import type { CalculateOptimalReroutingOutput } from '@/ai/flows/calculate-optimal-rerouting';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, CircleDollarSign, Clock, Route, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function SentinelDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [disruptions, setDisruptions] = useState<PredictDisruptionsOutput | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [rerouteResult, setRerouteResult] = useState<CalculateOptimalReroutingOutput | null>(null);
  const [isRerouteDialogOpen, setIsRerouteDialogOpen] = useState(false);
  const [disruptionForecast, setDisruptionForecast] = useState('');

  const { toast } = useToast();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleSimulate = async (scenarioInput: any) => {
    setIsLoading(true);
    handleClear();
    setDisruptionForecast(Object.values(scenarioInput).join(' '));

    try {
      const result = await predictDisruptions(scenarioInput);
      setDisruptions(result);
      const atRiskShipmentIds = new Set(result.disruptions.flatMap(d => d.affectedShipments.map(s => s.shipmentId)));
      setShipments(prevShipments =>
        prevShipments.map(s =>
          atRiskShipmentIds.has(s.id) ? { ...s, status: 'At Risk' } : { ...s, status: 'On Time' }
        )
      );
      toast({
        title: 'Disruption Forecast Updated',
        description: `${result.disruptions.length} potential disruption(s) identified.`,
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: 'An error occurred while predicting disruptions.',
      });
    }

    setIsLoading(false);
  };
  
  const handleShipmentSelect = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setRerouteResult(null);
    if(shipment.status === 'At Risk') {
        setIsRerouteDialogOpen(true);
    }
  }

  const handleRerouteCalculated = (result: CalculateOptimalReroutingOutput) => {
    setRerouteResult(result);
  };
  
  const handleClear = () => {
    setDisruptions(null);
    setSelectedShipment(null);
    setRerouteResult(null);
    setShipments(mockShipments);
  }
  
  const getReroutePath = () => {
    if (!rerouteResult) return undefined;
    // This is a mock parsing. A real implementation would need a more robust way to handle route strings.
    try {
        const coords = rerouteResult.optimalRoute.match(/-?\d+\.\d+,\s*-?\d+\.\d+/g);
        if(!coords || !selectedShipment) return undefined;
        return coords.map(c => {
            const [lat, lng] = c.split(',').map(Number);
            return {lat, lng};
        });
    } catch {
        return undefined; // Fallback
    }
  }

  return (
    <APIProvider apiKey={apiKey ?? ''}>
      <div className="flex h-full bg-background">
        <SidebarControls
          isLoading={isLoading}
          onSimulate={handleSimulate}
          disruptions={disruptions}
          shipments={shipments}
          onShipmentSelect={handleShipmentSelect}
          selectedShipment={selectedShipment}
          onClear={handleClear}
        />
        <main className="flex-1 p-4 flex flex-col gap-4 relative">
          <MapView 
              shipments={shipments} 
              disruptions={disruptions?.disruptions ?? null}
              selectedShipment={selectedShipment}
              reroutePath={getReroutePath()}
          />
          {rerouteResult && selectedShipment && (
              <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl shadow-2xl animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
                  <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                          <div>
                              <CardTitle>Optimal Reroute for {selectedShipment.id}</CardTitle>
                              <CardDescription>AI-generated alternative route to mitigate disruption.</CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRerouteResult(null)}>
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <div className="flex items-center gap-2 font-semibold">
                                 <Route className="h-5 w-5 text-primary" /> 
                                 New Route Details
                                 <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                                            <Info className="h-4 w-4 text-muted-foreground"/>
                                          </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs">
                                          <h4 className="font-bold mb-1">Alternative Routes Considered</h4>
                                          <ul className="list-disc pl-4 text-xs">
                                              {rerouteResult.alternatives.map((alt, i) => <li key={i}>{alt}</li>)}
                                          </ul>
                                      </TooltipContent>
                                  </Tooltip>
                                 </TooltipProvider>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted/50 rounded-md">{rerouteResult.optimalRoute}</p>
                          </div>
                          <div>
                              <h4 className="font-semibold mb-2">Estimated Impact</h4>
                              <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                                      <span className="flex items-center gap-2 text-green-600"><CircleDollarSign className="h-4 w-4"/>Estimated Cost</span>
                                      <span className="font-mono font-semibold">${rerouteResult.estimatedCost.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                                      <span className="flex items-center gap-2 text-blue-600"><Clock className="h-4 w-4"/>Estimated Time</span>
                                      <span className="font-mono font-semibold">{rerouteResult.estimatedTime} hours</span>
                                  </div>
                                  <div className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                                      <span className="flex items-center gap-2 text-teal-600"><Leaf className="h-4 w-4"/>Est. CO₂ Emissions</span>
                                      <span className="font-mono font-semibold">{rerouteResult.estimatedCO2Emissions.toLocaleString()} kg</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          )}
        </main>
        <RerouteDialog
          open={isRerouteDialogOpen}
          onOpenChange={setIsRerouteDialogOpen}
          shipment={selectedShipment}
          disruptionForecast={disruptionForecast}
          onRerouteCalculated={handleRerouteCalculated}
        />
      </div>
    </APIProvider>
  );
}
