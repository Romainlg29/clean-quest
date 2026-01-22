import { api } from "@/lib/api";
import type { create_event_schema } from "@api/schemas/events";
import { useMutation } from "@tanstack/react-query";
import type z from "zod";

export const useCreateEvent = () =>
  useMutation({
    mutationKey: ["create-event"],
    mutationFn: async (data: z.infer<typeof create_event_schema>) => {
      const response = await api.v1.events.post(data);

      if (response.error) {
        alert("Failed to create event: " + response.error);
        throw new Error("Failed to create event");
      }

      return response.data;
    },
  });
