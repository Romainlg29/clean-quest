import FitToPosition from "@/components/domain/map/fit-to-position";
import UserCurrentPositionMarker from "@/components/domain/map/user-current-position-marker";
import WatchMapBounds from "@/components/domain/map/watch-map-bounds";
import ProximityLeaderboard from "@/components/domain/score/proximity-leaderboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router";
import { LogInIcon, LogOutIcon, MapPlusIcon } from "lucide-react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import UserTraces from "@/components/domain/map/user-traces";
import { api } from "@/lib/api";
import EventList from "@/components/domain/events/event-list";
import UserTracesMarker from "@/components/domain/map/user-traces-marker";

const Home = () => {
  const context = useRouteContext({
    strict: false,
  });

  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        collapsible="none"
        style={{
          // @ts-expect-error CSS variable
          "--sidebar-width": "24rem",
        }}
      >
        <SidebarHeader>
          <Card className="flex flex-row p-2 items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <img src="/icon.png" className="h-12" />
              <p>CleanQuest</p>
            </div>

            <Button
              variant={"secondary"}
              onClick={() => {
                if ((context as { authenticated: boolean }).authenticated) {
                  navigate({ to: "/new-path" });
                } else {
                  navigate({ to: "/auth" });
                }
              }}
            >
              <MapPlusIcon className="size-4" />
              Nouvelle collecte
            </Button>
          </Card>
        </SidebarHeader>
        <SidebarContent>
          {(context as { authenticated: boolean }).authenticated ? null : (
            <Card className="flex flex-col gap-1 px-4 py-2 mx-2">
              <p>Explore ta ville en jouant !</p>
              <p>
                Parcours un espace réel, enregistre ta surface et découvre les
                déchets qui s'y trouvent.
              </p>
              <p>
                Prends-les en photo pour les collecter et nettoyer la ville.
              </p>
              <p>
                Gagne des points, crée des territoires et compare ton impact
                avec les autres.
              </p>
              <p>Chaque pas compte pour une ville plus propre</p>
            </Card>
          )}

          <ProximityLeaderboard />
          <EventList />
        </SidebarContent>
        <SidebarFooter>
          {(context as { authenticated: boolean }).authenticated ? (
            <Card className="flex flex-row items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <div className="size-8 bg-blue-400 rounded-4xl" />
                <p>Mon compte</p>
              </div>

              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => navigate({ to: "/log-out" })}
              >
                <LogOutIcon className="size-4" />
              </Button>
            </Card>
          ) : (
            <Card className="flex flex-row items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <p>Se connecter / S'inscrire</p>
              </div>

              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => navigate({ to: "/auth" })}
              >
                <LogInIcon className="size-4" />
              </Button>
            </Card>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <main className="w-full h-full flex flex-col p-2">
          <Map style={{ borderRadius: "var(--radius)" }}>
            <Source
              type="raster"
              tiles={["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]}
            >
              <Layer type="raster" />
            </Source>

            <WatchMapBounds />
            <UserCurrentPositionMarker />
            <FitToPosition />

            <UserTraces />
            <UserTracesMarker />
          </Map>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad: async () => {
    // Validate if the user is already authenticated
    const response = await api.v1.auth.verify.post();

    return { authenticated: response.status === 200 };
  },
});
