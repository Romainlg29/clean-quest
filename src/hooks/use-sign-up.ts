import { api } from "@/lib/api";
import type { sign_up_schema } from "@api/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import type z from "zod";

export const useSignUp = () =>
  useMutation({
    mutationKey: ["sign-up"],
    mutationFn: async (data: z.infer<typeof sign_up_schema>) => {
      const response = await api.v1.auth["sign-up"].post({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        username: data.username,
      });

      if (response.error) {
        throw new Error("Failed to sign up");
      }

      return response.data;
    },
  });
