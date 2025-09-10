'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { calculateOptimalRerouting } from '@/ai/flows/calculate-optimal-rerouting';
import type { Shipment } from '@/app/lib/types';
import type { CalculateOptimalReroutingOutput } from '@/ai/flows/calculate-optimal-rerouting';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Leaf, CircleDollarSign, Clock } from 'lucide-react';

type RerouteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
  disruptionForecast: string;
  onRerouteCalculated: (result: CalculateOptimalReroutingOutput) => void;
};

export function RerouteDialog({
  open,
  onOpenChange,
  shipment,
  disruptionForecast,
  onRerouteCalculated,
}: RerouteDialogProps) {
  const [constraints, setConstraints] = useState({ cost: 50, time: 50, sustainability: 50 });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async () => {
    if (!shipment) return;

    setIsLoading(true);
    const shipmentDetails = `Shipment ID: ${shipment.id}, from ${shipment.origin.name} to ${shipment.destination.name}, contents: ${shipment.contents}`;
    
    try {
      const result = await calculateOptimalRerouting({
        shipmentDetails,
        disruptionForecast,
        constraints,
      });
      onRerouteCalculated(result);
      toast({
        title: "Optimal Route Found",
        description: "The best alternative route has been calculated and displayed.",
      });
      onOpenChange(false);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: "Error",
        description: "Could not calculate an optimal route.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Optimize Rerouting for {shipment?.id}</DialogTitle>
          <DialogDescription>
            Adjust the priority of cost, time, and sustainability to find the best alternative route.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cost-slider" className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4"/>Cost Priority</Label>
            <Slider
              id="cost-slider"
              value={[constraints.cost]}
              onValueChange={([value]) => setConstraints(c => ({ ...c, cost: value }))}
              max={100}
              step={1}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time-slider" className="flex items-center gap-2"><Clock className="h-4 w-4"/>Time Priority</Label>
            <Slider
              id="time-slider"
              value={[constraints.time]}
              onValueChange={([value]) => setConstraints(c => ({ ...c, time: value }))}
              max={100}
              step={1}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sustainability-slider" className="flex items-center gap-2"><Leaf className="h-4 w-4"/>Sustainability Priority</Label>
            <Slider
              id="sustainability-slider"
              value={[constraints.sustainability]}
              onValueChange={([value]) => setConstraints(c => ({ ...c, sustainability: value }))}
              max={100}
              step={1}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleCalculate} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              'Find Optimal Route'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
