import { treaty } from "@elysiajs/eden";
import type { Api } from "api/src/index";

export const api = treaty<Api>(
  import.meta.env.VITE_APP_API_BASE_URL as string,
  {
    fetch: {
      credentials: "include",
    },
  },
);
