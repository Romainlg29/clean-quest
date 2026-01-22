import {
  SidebarGroup,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useProximityLeaderboard } from "@/hooks/use-proximity-leaderboard";
import { cn } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import { FrownIcon, MedalIcon, TrophyIcon } from "lucide-react";

const ProximityLeaderboard = () => {
  const search = useSearch({ strict: false });

  const { data, isError, isLoading } = useProximityLeaderboard(
    search.bounds as undefined | [number, number, number, number],
  );

  return (
    <SidebarGroup>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <TrophyIcon className="size-5 text-yellow-400" />
          Classement local
        </SidebarMenuButton>

        <SidebarMenuSub>
          {isError ? (
            <SidebarMenuSubItem>
              <p>Erreur lors du chargement du classement.</p>
            </SidebarMenuSubItem>
          ) : null}

          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <SidebarMenuSubItem key={`proximity-loading-${i}`}>
                  <SidebarMenuSkeleton />
                </SidebarMenuSubItem>
              ))
            : null}

          {data && data.length > 0 ? (
            data.map((entry, index) => {
              return (
                <SidebarMenuSubItem key={entry.id}>
                  {index < 3 ? (
                    <MedalIcon
                      className={cn(
                        "size-4 mr-2",
                        index === 0 ? "text-yellow-400" : "",
                        index === 1 ? "text-gray-400" : "",
                        index === 2 ? "text-yellow-700" : "",
                      )}
                    />
                  ) : null}
                  <p
                    className={cn(
                      index === 0 ? "font-bold text-yellow-400" : "",
                      index === 1 ? "font-bold text-gray-400" : "",
                      index === 2 ? "font-bold text-yellow-700" : "",
                    )}
                  >
                    {entry.username}
                  </p>
                  <SidebarMenuBadge
                    className={cn(
                      index === 0 ? "bg-yellow-100 text-yellow-800" : "",
                      index === 1 ? "bg-gray-100 text-gray-800" : "",
                      index === 2 ? "bg-yellow-200 text-yellow-900" : "",
                    )}
                  >
                    {entry.score} pts
                  </SidebarMenuBadge>
                </SidebarMenuSubItem>
              );
            })
          ) : (
            <SidebarMenuSubItem className="flex items-center gap-2">
              <FrownIcon className="size-5" />
              Aucun utilisateur à proximité.
            </SidebarMenuSubItem>
          )}
        </SidebarMenuSub>
      </SidebarMenuItem>
    </SidebarGroup>
  );
};

export default ProximityLeaderboard;
