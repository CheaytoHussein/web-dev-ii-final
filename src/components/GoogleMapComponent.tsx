import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface GoogleMapComponentProps {
  pickupAddress?: string;
  deliveryAddress?: string;
  driverLocation?: { lat: number; lng: number } | null;
  isLive?: boolean;
  height?: string;
}

const GoogleMapComponent = ({
  pickupAddress,
  deliveryAddress,
  driverLocation,
  isLive = false,
  height = "400px",
}: GoogleMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Load Google Maps API script
    const loadGoogleMapsApi = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      // This would be replaced with actual API key from environment variables
      const apiKey = "AIzaSyB2JuZEgEc3CFQIPRofW4cQuLWTtxQZjsc";

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => {
        toast({
          title: "Google Maps Error",
          description: "Failed to load Google Maps API",
          variant: "destructive",
        });
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsApi();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      // Initialize map if not already initialized
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Initialize directions renderer
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: isLive, // Suppress default markers when in live mode
          polylineOptions: {
            strokeColor: "#9b87f5",
            strokeWeight: 5,
            strokeOpacity: 0.7,
          },
        });

        directionsRendererRef.current.setMap(mapInstanceRef.current);
      }

      // If we have both addresses, get directions
      if (pickupAddress && deliveryAddress) {
        calculateRoute();
      }
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map",
        variant: "destructive",
      });
    }
  }, [mapLoaded, pickupAddress, deliveryAddress, isLive]);

  useEffect(() => {
    // Update driver marker when driverLocation changes
    if (!mapLoaded || !mapInstanceRef.current || !driverLocation) return;

    try {
      const driverLatLng = new google.maps.LatLng(driverLocation.lat, driverLocation.lng);

      if (!driverMarkerRef.current) {
        // Create driver marker if it doesn't exist
        driverMarkerRef.current = new google.maps.Marker({
          position: driverLatLng,
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4CAF50",
            fillOpacity: 1,
            strokeColor: "#FFF",
            strokeWeight: 2,
          },
          title: "Driver location",
        });
      } else {
        // Update driver marker position
        driverMarkerRef.current.setPosition(driverLatLng);
      }

      // Center map on driver if in live mode
      if (isLive) {
        mapInstanceRef.current.panTo(driverLatLng);
      }
    } catch (error) {
      console.error("Error updating driver marker:", error);
    }
  }, [mapLoaded, driverLocation, isLive]);

  const calculateRoute = () => {
    if (!pickupAddress || !deliveryAddress) return;

    try {
      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: pickupAddress,
          destination: deliveryAddress,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error("Directions request failed:", status);
            toast({
              title: "Route Error",
              description: "Failed to calculate the delivery route",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        borderRadius: "0.375rem", // rounded-md
        overflow: "hidden",
      }}
    >
      {!mapLoaded && (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;
