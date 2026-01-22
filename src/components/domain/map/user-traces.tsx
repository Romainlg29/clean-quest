import { useUsersPolygonsInBounds } from "@/hooks/use-users-polygons-in-bounds";
import { useSearch } from "@tanstack/react-router";
import { Layer, Source } from "react-map-gl/maplibre";

const UserTraces = () => {
  const search = useSearch({ strict: false });
  const { data } = useUsersPolygonsInBounds(
    search.bounds as [number, number, number, number],
  );

  if (!data) {
    return null;
  }

  return (
    <Source type="geojson" data={data}>
      <Layer
        id="user-traces-layer"
        type="fill"
        paint={{
          "fill-color": "rgba(0, 150, 255, 0.3)",
          "fill-outline-color": "rgba(0, 150, 255, 0.8)",
        }}
      />
    </Source>
  );
};

export default UserTraces;
