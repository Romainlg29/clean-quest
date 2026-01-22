import { database } from "../lib/database";
import { tryCatch } from "../utils/try-catch";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import z from "zod";

const app = new Elysia({ prefix: "/paths" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_HASH_KEY ?? "default",
      exp: "7d",
    }),
  )

  .get(
    "/",
    async (c) => {
      const { limit, offset, bbox } = c.query;

      const [error, data] = await tryCatch<
        {
          id: string;
          username: string;
          score: number;
        }[]
      >(
        bbox
          ? database`
            SELECT users.id,
                users.username,
                COALESCE(SUM(paths.surface), 0) as score
            FROM users
            LEFT JOIN paths ON users.id = paths.user_id
              AND ST_Intersects(
                paths.polygon,
                ST_MakeEnvelope(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]}, 4326)
              )
            GROUP BY users.id, users.username
            HAVING COALESCE(SUM(paths.surface), 0) > 0
            ORDER BY score DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `
          : database`
            SELECT users.id,
                users.username,
                users.score
            FROM users
            ORDER BY users.score DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `,
      );

      if (error) {
        return c.status("Internal Server Error", {
          error: "Failed to retrieve the users",
        });
      }

      return data;
    },
    {
      query: z.object({
        // The number of items to return
        limit: z.coerce
          .number()
          .min(1)
          .max(100)
          .optional()
          .transform((x) => (x ? x : undefined))
          .default(10),

        // The page number for pagination
        offset: z.coerce
          .number()
          .min(0)
          .optional()
          .transform((x) => (x ? x : undefined))
          .default(0),

        // Bounding box (minLon, minLat, maxLon, maxLat)
        bbox: z.array(z.coerce.number()).length(4).optional(),
      }),
    },
  );

export const paths = app;
