import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useProximityEvents = () =>
  useQuery({
    queryKey: ["proximity-events"],
    queryFn: async () => {
      const response = await api.v1.events.get();

      if (response.error) {
        throw new Error("unable to fetch proximity events");
      }

      return response.data;
    },
    placeholderData: [],
  });
