'use client';

import { Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Truck, Warehouse, AlertTriangle, MapPin, Wind } from 'lucide-react';
import type { PredictDisruptionsOutput } from '@/ai/flows/predict-disruptions';
import type { Shipment } from '@/app/lib/types';
import React, { useEffect, useState, useMemo } from 'react';
import { mockFreightCorridors } from '../lib/mock-data';
import { cn } from '@/lib/utils';

type MapViewProps = {
  shipments: Shipment[];
  disruptions: PredictDisruptionsOutput['disruptions'] | null;
  selectedShipment: Shipment | null;
  reroutePath?: { lat: number; lng: number }[];
};

function Polyline(props: google.maps.PolylineOptions) {
    const map = useMap();
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map) return;
        if (!polyline) {
            const newPolyline = new google.maps.Polyline({ ...props, map });
            setPolyline(newPolyline);
        } else {
            polyline.setOptions(props);
        }

        return () => {
          if(polyline) {
            polyline.setMap(null);
          }
        }
    }, [map, polyline, props]);

    return null;
}

function Directions({ shipment, reroutePath }: { shipment: Shipment, reroutePath?: { lat: number; lng: number }[] }) {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [route, setRoute] = useState<google.maps.DirectionsRoute | null>(null);

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
            map, 
            suppressMarkers: true, // We have our own markers
            preserveViewport: true,
        }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer) return;

        directionsService.route({
            origin: shipment.origin,
            destination: shipment.destination,
            travelMode: google.maps.TravelMode.DRIVING,
        }).then(response => {
            directionsRenderer.setDirections(response);
            setRoute(response.routes[0]);
        }).catch(e => console.error('Directions request failed', e));
        
        return () => {
            if (directionsRenderer) {
                directionsRenderer.setDirections({routes: []});
            }
        }

    }, [directionsService, directionsRenderer, shipment]);
    
    useEffect(() => {
      if (map && route) {
        const bounds = new google.maps.LatLngBounds();
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
                step.path.forEach(path => {
                    bounds.extend(path);
                })
            })
        });
        if (reroutePath) {
          reroutePath.forEach(pos => bounds.extend(pos));
        }
        map.fitBounds(bounds, 100);
      }
    }, [route, map, reroutePath])

    useEffect(() => {
        if (!directionsRenderer) return;

        if (reroutePath) {
            // Hide original route when reroute is shown
            directionsRenderer.setOptions({
                polylineOptions: {
                    strokeOpacity: 0.4,
                    strokeColor: 'hsl(var(--primary))'
                }
            })
        } else {
             directionsRenderer.setOptions({
                polylineOptions: {
                    strokeOpacity: 0.8,
                    strokeWeight: 8,
                    strokeColor: shipment.status === 'At Risk' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
                }
            })
        }
    }, [reroutePath, directionsRenderer, shipment.status]);

    return (
        <>
            {reroutePath && (
              <Polyline
                path={reroutePath}
                strokeColor="hsl(var(--accent))"
                strokeOpacity={0.8}
                strokeWeight={8}
                icons={[{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                    offset: '0',
                    repeat: '20px'
                }]}
              />
            )}
            {route && <AdvancedMarker position={route.legs[0].start_location}>
                <Truck className="h-8 w-8 text-primary bg-background rounded-full p-1 shadow-lg" />
            </AdvancedMarker>}
        </>
    );
}


export function MapView({ shipments, disruptions, selectedShipment, reroutePath }: MapViewProps) {
  const map = useMap();
  const [selectedMarker, setSelectedMarker] = useState<Shipment | null>(null);

  const disruptionLocations = useMemo(() => {
      if (!disruptions) return [];
      return disruptions.flatMap(d => d.affectedShipments.map(s => {
          const [lat, lng] = s.location.split(',').map(parseFloat);
          return { type: d.type, severity: d.severity, lat, lng };
      }));
  }, [disruptions]);

  useEffect(() => {
    if (map && !selectedShipment) {
        map.moveCamera({center: {lat: 39.8283, lng: -98.5795}, zoom: 4});
    }
  }, [selectedShipment, map]);
  
  const getDisruptionIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'weather': return <Wind className="h-6 w-6 text-destructive" />;
        case 'hurricane': return <Wind className="h-6 w-6 text-destructive" />;
        case 'congestion': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        default: return <AlertTriangle className="h-6 w-6 text-destructive" />;
    }
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative">
      <Map
        defaultCenter={{ lat: 39.8283, lng: -98.5795 }}
        defaultZoom={4}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId="a3b0c4d1e2f3a4b5"
        className="h-full w-full"
      >
        {/* Freight Corridors */}
        {mockFreightCorridors.map(corridor => (
            <Polyline key={corridor.id} path={corridor.path} strokeColor="#a0a0a0" strokeOpacity={0.6} strokeWeight={3} />
        ))}
        
        {/* Shipments */}
        {shipments.map(shipment => {
          const isAtRisk = shipment.status === 'At Risk' || shipment.status === 'Delayed';
          const isSelected = selectedShipment?.id === shipment.id;
          const markerColor = isAtRisk ? 'text-destructive' : isSelected ? 'text-accent' : 'text-primary';

          return (
          <React.Fragment key={shipment.id}>
            <AdvancedMarker position={shipment.origin} onClick={() => setSelectedMarker(shipment)}>
              <Warehouse className={cn("h-6 w-6", markerColor)} />
            </AdvancedMarker>
            <AdvancedMarker position={shipment.destination} onClick={() => setSelectedMarker(shipment)}>
              <MapPin className={cn("h-6 w-6", markerColor)} />
            </AdvancedMarker>
          </React.Fragment>
        )})}

        {selectedMarker && (
            <InfoWindow position={selectedMarker.origin} onCloseClick={() => setSelectedMarker(null)}>
                <div className="p-1">
                    <h4 className="font-bold">{selectedMarker.id}</h4>
                    <p>{selectedMarker.contents}</p>
                    <p>Origin: {selectedMarker.origin.name}</p>
                    <p>Destination: {selectedMarker.destination.name}</p>
                </div>
            </InfoWindow>
        )}

        {/* Selected Shipment Route */}
        {selectedShipment && (
          <Directions shipment={selectedShipment} reroutePath={reroutePath} />
        )}

        {/* Disruption Zones */}
        {disruptionLocations.map((disruption, index) => {
            if(isNaN(disruption.lat) || isNaN(disruption.lng)) return null;

            return (
              <AdvancedMarker key={index} position={{lat: disruption.lat, lng: disruption.lng}}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-24 w-24 bg-destructive/20 rounded-full animate-pulse"></div>
                  {getDisruptionIcon(disruption.type)}
                </div>
              </AdvancedMarker>
            )
        })}

      </Map>
    </div>
  );
}
