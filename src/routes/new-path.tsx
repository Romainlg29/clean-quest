import FitToPosition from "@/components/domain/map/fit-to-position";
import UserCurrentPositionMarker from "@/components/domain/map/user-current-position-marker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { CameraIcon, PauseIcon, PlayIcon } from "lucide-react";

const Index = () => {
  const [has_started, set_has_started] = useState(false);
  const [is_paused, set_is_paused] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);

  useEffect(() => {
    if (!has_started) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        if (is_paused) {
          return;
        }

        setCoordinates((coords) => [
          ...coords,
          [p.coords.longitude, p.coords.latitude],
        ]);
      },
      (e) => console.error("Geolocation error:", e),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [has_started, is_paused]);

  const capture = () => {};

  return (
    <div className="relative w-full h-full flex flex-col">
      <Card className="absolute z-10 bottom-0 left-0 w-full h-24 rounded-b-none px-2 py-4 flex flex-row gap-2">
        {has_started ? (
          <Button
            variant={"destructive"}
            className="flex-1 h-14 rounded-4xl"
            onClick={() => set_has_started(false)}
          >
            Terminer la collecte
          </Button>
        ) : (
          <Button
            className="flex-1 h-14 rounded-4xl"
            onClick={() => set_has_started(true)}
          >
            Commencer la collecte
          </Button>
        )}

        {has_started && !is_paused ? (
          <Button
            variant={"secondary"}
            className="flex-none size-14 rounded-full"
            onClick={() => set_is_paused(true)}
          >
            <PauseIcon className="size-4" />
          </Button>
        ) : has_started && is_paused ? (
          <Button
            variant={"secondary"}
            className="flex-none size-14 rounded-full"
            onClick={() => set_is_paused(false)}
          >
            <PlayIcon className="size-4" />
          </Button>
        ) : null}

        <Button
          variant={"secondary"}
          className="flex-none size-14 rounded-full"
          onClick={capture}
        >
          <CameraIcon className="size-4" />
        </Button>
      </Card>

      <Map style={{ borderRadius: "var(--radius)" }}>
        <Source
          type="raster"
          tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
        >
          <Layer type="raster" />
        </Source>

        <Source
          type="geojson"
          data={{
            type: "Feature",
            geometry: { type: "LineString", coordinates },
            properties: {},
          }}
        >
          <Layer
            type="line"
            paint={{
              "line-color": "#FF0000",
              "line-width": 4,
            }}
          />
        </Source>

        <UserCurrentPositionMarker />
        <FitToPosition zoom={16} />
      </Map>
    </div>
  );
};

export const Route = createFileRoute("/new-path")({
  component: Index,
});
