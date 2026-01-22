import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

const WatchMapBounds = () => {
  const { current: map } = useMap();

  // Navigate
  const navigate = useNavigate();

  useEffect(() => {
    if (!map) {
      return;
    }

    // Update bounds on map move end
    const onMapMoveEnd = () =>
      navigate({
        to: ".",
        search: { bounds: map.getBounds().toArray().flat() },
      });

    map.on("moveend", onMapMoveEnd);

    return () => {
      map.off("moveend", onMapMoveEnd);
    };
  }, [map, navigate]);

  return null;
};

export default WatchMapBounds;
