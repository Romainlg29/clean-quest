import { useEffect, useState } from "react";
import { Marker, useMap, type MapMouseEvent } from "react-map-gl/maplibre";

const UserTracesMarker = () => {
  const { current: map } = useMap();

  const [features, setFeatures] = useState<GeoJSON.Feature[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    const onMove = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["user-traces-layer"],
      });

      setFeatures(features);
      setPosition([e.lngLat.lng, e.lngLat.lat]);
    };

    map.on("mousemove", onMove);

    return () => {
      map.off("mousemove", onMove);
    };
  }, [map]);

  return (
    <>
      {features.length > 0 && position ? (
        <Marker
          longitude={position ? position[0] : 0}
          latitude={position ? position[1] : 0}
        >
          <div className="bg-background p-2 flex flex-col gap-2 rounded-2xl cursor-none">
            {features
              // Extract unique usernames from features
              .reduce<string[]>((acc, feature) => {
                const username = feature.properties?.username;

                if (username && !acc.includes(username)) {
                  acc.push(username);
                }

                return acc;
              }, [])

              // Display each username only once
              .map((username) => (
                <p key={username}>{username}</p>
              ))}
          </div>
        </Marker>
      ) : null}
    </>
  );
};

export default UserTracesMarker;
