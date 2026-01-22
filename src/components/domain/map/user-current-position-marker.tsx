import { useGeolocation } from "@/hooks/use-geolocation";
import type { FC } from "react";
import { Marker } from "react-map-gl/maplibre";

const UserCurrentPositionMarker: FC = () => {
  const { position, error } = useGeolocation();

  if (!position || error) {
    return null;
  }

  return (
    <Marker
      longitude={position.coords.longitude}
      latitude={position.coords.latitude}
    >
      <div className="size-4 bg-blue-500 rounded-full border-2 border-white"></div>
    </Marker>
  );
};

export default UserCurrentPositionMarker;
