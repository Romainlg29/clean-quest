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
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOutIcon } from "lucide-react";
import Map, { Layer, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const Home = () => {
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
          <Card className="flex flex-row p-2 items-center gap-2 w-full">
            <img src="/icon.png" className="h-12" />
            <p>CleanQuest</p>
          </Card>
        </SidebarHeader>
        <SidebarContent>
          <ProximityLeaderboard />
        </SidebarContent>
        <SidebarFooter>
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
          </Map>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
});
