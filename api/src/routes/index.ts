import { Elysia } from "elysia";
import { auth } from "./auth";
import { paths } from "./paths";
import { scores } from "./scores";
import { events } from "./events";

export const v1 = new Elysia({ prefix: "/v1" })
  .use(auth)
  .use(paths)
  .use(scores)
  .use(events);
