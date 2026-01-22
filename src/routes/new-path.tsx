import FitToPosition from "@/components/domain/map/fit-to-position";
import UserCurrentPositionMarker from "@/components/domain/map/user-current-position-marker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { CameraIcon, PauseIcon, PlayIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNewPath } from "@/hooks/use-new-path";
import { toast } from "sonner";
import * as turf from "@turf/turf";

const Index = () => {
  const [has_started, set_has_started] = useState(false);
  const [is_paused, set_is_paused] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Store the previous coordinate to mesure the average speed
  const previous = useRef<GeolocationPosition | null>(null);

  const { mutateAsync: create } = useNewPath();

  const navigate = useNavigate();

  useEffect(() => {
    if (!has_started) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (p) => {
        if (is_paused) {
          return;
        }

        let speed = 0;
        if (previous.current) {
          const distance = turf.distance(
            turf.point([
              previous.current.coords.longitude,
              previous.current.coords.latitude,
            ]),
            turf.point([p.coords.longitude, p.coords.latitude]),
            { units: "meters" },
          );

          // in seconds
          const time = (p.timestamp - previous.current.timestamp) / 1000;

          // meters per second
          speed = distance / time;
        }

        if (speed > 60) {
          setCoordinates([]);
          set_has_started(false);
          set_is_paused(false);

          toast.warning(
            "Vitesse trop élevée détectée. Le suivi est réinitialisé.",
          );

          previous.current = null;
          return;
        }

        setCoordinates((coords) => [
          ...coords,
          [p.coords.longitude, p.coords.latitude],
        ]);

        previous.current = p;
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

  const capture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setFile(file);
  };

  const submit = async () => {
    if (!file) {
      toast.error("Veuillez capturer une photo avant de soumettre le chemin.");
      return;
    }

    await create(
      {
        coordinates,
        picture: Array.from(await file.bytes()),
        format: file.name.split(".").pop()!,
      },
      {
        onSuccess: () => {
          toast.success("Chemin créé avec succès !");
          set_has_started(false);

          navigate({ to: "/" });
        },
        onError: () => {
          toast.error("Échec de la création du chemin.");
        },
      },
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <Card className="absolute z-10 bottom-0 left-0 w-full h-24 rounded-b-none px-2 py-4 flex flex-row gap-2">
        {has_started ? (
          <Button
            variant={"destructive"}
            className="flex-1 h-14 rounded-4xl"
            onClick={() => submit()}
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

        <Input
          id="camera-input"
          name="camera-input"
          className="invisible absolute w-0 h-0 p-0 m-0"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={capture}
        />

        <Label
          htmlFor="camera-input"
          className="flex-none m-0 p-0 cursor-pointer"
        >
          <Button
            type="button"
            variant={"secondary"}
            className="flex-none size-14 rounded-full pointer-events-none"
          >
            <CameraIcon className="size-4" />
          </Button>
        </Label>
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
        <FitToPosition zoom={17} />
      </Map>
    </div>
  );
};

export const Route = createFileRoute("/new-path")({
  component: Index,
});
