import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { logger } from "./utils/logger";
import { v1 } from "./routes/index";
import { migrate } from "./lib/database";

await migrate();

const app = new Elysia()
  // Middlewares
  .use(openapi())
  .use(
    cors({
      origin: process.env.WEB_APP_URL ?? "http://localhost:5173",
      credentials: true,
    }),
  )
  .use(logger())

  // Routes
  .use(v1)

  // Listen on 5000 and network
  .listen({
    port: 5000,
    hostname: "0.0.0.0",
  });

export type Api = typeof app;
