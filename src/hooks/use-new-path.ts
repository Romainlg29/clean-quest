import { api } from "@/lib/api";
import type { create_path_schema } from "@api/schemas/paths";
import { useMutation } from "@tanstack/react-query";
import type z from "zod";

export const useNewPath = () =>
  useMutation({
    mutationKey: ["new-path"],
    mutationFn: async (data: z.infer<typeof create_path_schema>) => {
      const response = await api.v1.paths.post(data);

      if (response.error) {
        throw new Error("Failed to create path");
      }

      return response.data;
    },
  });
