'use client';

import {
  ShieldCheck,
  LoaderCircle,
  AlertTriangle,
  Wind,
  Flame,
  Snowflake,
  Ship,
  Truck,
  ListFilter,
  X,
  Warehouse,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm, Controller } from 'react-hook-form';
import { disruptionScenarios } from '@/app/lib/mock-data';
import type { PredictDisruptionsOutput } from '@/ai/flows/predict-disruptions';
import type { Shipment } from '@/app/lib/types';
import { useState } from 'react';

type SidebarProps = {
  isLoading: boolean;
  onSimulate: (data: any) => void;
  onClear: () => void;
  disruptions: PredictDisruptionsOutput | null;
  shipments: Shipment[];
  onShipmentSelect: (shipment: Shipment) => void;
  selectedShipment: Shipment | null;
};

const DisruptionIcons: { [key: string]: React.ElementType } = {
    'weather': Wind,
    'congestion': AlertTriangle,
    'default': AlertTriangle,
}

const ShipmentStatusIcons: { [key: string]: React.ElementType } = {
    'On Time': Truck,
    'At Risk': AlertTriangle,
    'Delayed': Clock,
}

const ShipmentStatusColors: { [key: string]: string } = {
    'On Time': 'text-green-500',
    'At Risk': 'text-yellow-500',
    'Delayed': 'text-red-500',
}


export function SidebarControls({
  isLoading,
  onSimulate,
  onClear,
  disruptions,
  shipments,
  onShipmentSelect,
  selectedShipment
}: SidebarProps) {
  const { control, handleSubmit, watch } = useForm();
  const scenario = watch('scenario');
  const [shipmentFilter, setShipmentFilter] = useState('all');

  const onSubmit = () => {
    const selectedScenario = disruptionScenarios.find(s => s.value === scenario);
    if (selectedScenario) {
      onSimulate(selectedScenario.mockInput);
    }
  };
  
  const filteredShipments = shipments.filter(s => {
    if (shipmentFilter === 'all') return true;
    if (shipmentFilter === 'at_risk') return s.status === 'At Risk';
    return false;
  })

  return (
    <aside className="w-96 min-w-96 flex flex-col border-r h-full bg-card">
      <header className="p-4 border-b">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Supply Chain Sentinel</h1>
            <p className="text-xs text-muted-foreground">Predictive Logistics & Resilience</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-b space-y-4">
        <h2 className="text-lg font-semibold">Disruption Simulator</h2>
        <Controller
          name="scenario"
          control={control}
          defaultValue="hurricane"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a disruption scenario..." />
              </SelectTrigger>
              <SelectContent>
                {disruptionScenarios.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || !scenario} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
                <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
                </>
            ) : (
                'Run Simulation'
            )}
            </Button>
            <Button variant="outline" type="button" onClick={onClear} className="shrink-0" title="Clear simulation results">
                <X className="h-4 w-4"/>
            </Button>
        </div>
      </form>

      <div className="flex-1 flex flex-col min-h-0">
        {disruptions && disruptions.disruptions.length > 0 && (
             <div className="p-4 border-b">
                <h3 className="text-base font-semibold mb-2">Active Disruptions</h3>
                <ScrollArea className="h-32">
                    <div className="space-y-2">
                    {disruptions.disruptions.map((d, i) => {
                        const Icon = DisruptionIcons[d.type.toLowerCase()] || DisruptionIcons.default;
                        return (
                            <div key={i} className="flex items-start gap-3 text-sm p-2 bg-destructive/10 rounded-lg">
                                <Icon className="h-5 w-5 mt-0.5 text-destructive shrink-0" />
                                <div>
                                    <p className="font-medium text-destructive">{d.type}</p>
                                    <p className="text-muted-foreground text-xs">{d.location}</p>
                                </div>
                                <Badge variant="destructive" className="ml-auto capitalize">{d.severity}</Badge>
                            </div>
                        )
                    })}
                    </div>
                </ScrollArea>
             </div>
        )}

        <div className="p-4 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold">Shipment Watchlist</h3>
                <Select value={shipmentFilter} onValueChange={setShipmentFilter}>
                    <SelectTrigger className="h-8 w-auto gap-1">
                        <ListFilter className="h-3.5 w-3.5"/>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
          <ScrollArea className="flex-1 -mx-4">
            <div className="px-4 space-y-2">
            {filteredShipments.map(shipment => {
                const Icon = ShipmentStatusIcons[shipment.status];
                const color = ShipmentStatusColors[shipment.status];
              return (
                <button key={shipment.id} onClick={() => onShipmentSelect(shipment)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedShipment?.id === shipment.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-sm">{shipment.id}</p>
                        <Badge variant={shipment.status === 'At Risk' ? 'destructive' : 'secondary'} className={shipment.status === 'On Time' ? 'bg-green-100 text-green-800' : ''}>{shipment.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{shipment.contents}</p>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <Warehouse className="h-3.5 w-3.5" /> <span className="truncate">{shipment.origin.name}</span>
                    </div>
                     <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> <span className="truncate">{shipment.destination.name}</span>
                    </div>
                </button>
              );
            })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
}
