import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useProximityLeaderboard = (
  bounds: [number, number, number, number] = [-180, -90, 180, 90],
) =>
  useQuery({
    queryKey: ["proximity-leaderboard", bounds],
    queryFn: async () => {
      const response = await api.v1.paths.get({
        query: { bbox: bounds, limit: 10, offset: 0 },
      });

      if (response.error) {
        throw new Error("unable to fetch proximity scores");
      }

      return response.data;
    },
    placeholderData: [],
  });
