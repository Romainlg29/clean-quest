import { database } from "../lib/database";
import { tryCatch } from "../utils/try-catch";
import Elysia from "elysia";
import { z } from "zod";
import { create_event_schema } from "../schemas/events";
import jwt from "@elysiajs/jwt";

const app = new Elysia({ prefix: "/events" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_HASH_KEY ?? "default",
      exp: "7d",
    }),
  )

  .get("/", async (c) => {
    const [error, data] = await tryCatch<
      {
        id: string;
        name: string;
        start_at: number;
      }[]
    >(
      database`
        SELECT
          events.id,
          events.name,
          events.start_at
        FROM events
        `,
    );

    if (error) {
      console.error(error);

      return c.status("Internal Server Error", {
        error: "Failed to retrieve the events",
      });
    }

    // Convert to plain array
    const events = Array.from(data);

    return events;
  })
  .post(
    "/",
    async (c) => {
      const { name, description, location, start_at } = c.body;

      // Validate the user
      const user = await c.jwt.verify(c.cookie.token.value);

      if (!user) {
        return c.status("Unauthorized", { error: "Invalid token" });
      }

      const [error] = await tryCatch(database`
        INSERT INTO events (
          name,
          description,
          location,
          start_at,
          end_at,
          created_by
        )  
        VALUES (
          ${name},
          ${description},
          ${location},
          to_timestamp(${start_at} / 1000.0),
          to_timestamp(${start_at} / 1000.0),
          ${user.id}
        )
      `);

      if (error) {
        console.error(error);
        return c.status("Internal Server Error", {
          error: "Failed to create the event",
        });
      }

      return c.status("Created", { message: "Event created successfully" });
    },
    { body: create_event_schema, cookie: z.object({ token: z.string() }) },
  );

export const events = app;
