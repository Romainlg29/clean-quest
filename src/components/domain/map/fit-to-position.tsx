import { useGeolocation } from "@/hooks/use-geolocation";
import { useEffect, useRef, type FC } from "react";
import { useMap } from "react-map-gl/maplibre";

type FitToPositionProps = {
  zoom?: number;
};

const FitToPosition: FC<FitToPositionProps> = ({ zoom = 13 }) => {
  const { position } = useGeolocation();
  const once = useRef(false);

  const { current: map } = useMap();

  useEffect(
    () => {
      if (!map) {
        return;
      }

      if (!position || once.current) {
        return;
      }

      map.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom,
      });

      once.current = true;
    },
    // Only run once
    [map, position],
  );

  return null;
};

export default FitToPosition;
