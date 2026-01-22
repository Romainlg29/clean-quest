import { api } from "@/lib/api";
import type { sign_in_schema } from "@api/schemas/auth";
import { useMutation } from "@tanstack/react-query";
import type z from "zod";

export const useSignIn = () =>
  useMutation({
    mutationKey: ["sign-in"],
    mutationFn: async (data: z.infer<typeof sign_in_schema>) => {
      const response = await api.v1.auth["sign-in"].post({
        password: data.password,
        usernameOrEmail: data.usernameOrEmail,
      });

      if (response.error) {
        alert("Failed to sign in: " + response.error);
        throw new Error("Failed to sign in");
      }

      return response.data;
    },
  });
