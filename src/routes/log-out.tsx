import { api } from "@/lib/api";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/log-out")({
  beforeLoad: async () => {
    const result = await api.v1.auth["log-out"].post();

    if (result.status !== 200) {
      throw new Error("Failed to log out");
    }

    throw redirect({ to: "/" });
  },
});
