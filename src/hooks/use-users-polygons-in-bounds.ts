import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useUsersPolygonsInBounds = (
  bounds: [number, number, number, number] = [-180, -90, 180, 90],
) => {
  return useQuery<GeoJSON.FeatureCollection>({
    queryKey: ["users-polygons-in-bounds"],
    queryFn: async () => {
      const response = await api.v1.paths.polygons.get({
        query: { bbox: bounds },
      });

      if (response.error) {
        throw new Error("Failed to fetch users polygons in bounds");
      }
      return response.data;
    },
    placeholderData: {
      type: "FeatureCollection",
      features: [],
    },
  });
};
