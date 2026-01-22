import { database } from "../lib/database";
import { tryCatch } from "../utils/try-catch";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import z from "zod";
import { create_path_schema } from "../schemas/paths";
import * as turf from "@turf/turf";

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
        database`
          SELECT 
            users.id,
            users.username,
            users.score
          FROM users
          JOIN paths ON paths.user_id = users.id
          WHERE ST_Intersects(
            paths.polygon,
            ST_MakeEnvelope(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]}, 4326)
          )
          GROUP BY users.id
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

      // Convert to plain array
      const users = Array.from(data);

      return users;
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
        bbox: z.array(z.coerce.number()).length(4),
      }),
    },
  )
  .post(
    "/",
    async (c) => {
      const { coordinates, picture, format } = c.body;

      // Validate the user
      const user = await c.jwt.verify(c.cookie.token.value);

      if (!user) {
        return c.status("Unauthorized", { error: "Invalid token" });
      }

      const feature: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
        properties: {},
      };

      // Convert the LineString to a Polygon
      const polygon = turf.lineToPolygon(feature);

      // Calculate the surface area in square meters
      const surface = turf.area(polygon);

      // Calculate the length in meters
      const length = turf.length(feature, { units: "meters" });

      const path = `.uploads/${Bun.randomUUIDv7()}.${format}`;

      const [write_error] = await tryCatch(
        Bun.write(path, new Uint8Array(picture)),
      );

      if (write_error) {
        return c.status("Internal Server Error", {
          error: "Failed to save the picture",
        });
      }

      // Check if the user is a regular player
      // Regular if they have created more than 5 paths this month
      const [regular_error, is_regular] = await tryCatch<boolean>(database`
        SELECT COUNT(*) >= 5 AS is_regular
        FROM paths
        WHERE user_id = ${user.id}
          AND created_at >= NOW() - INTERVAL '30 days'
      `);

      if (regular_error) {
        return c.status("Internal Server Error", {
          error: "Failed to verify user status",
        });
      }

      const [insert_error, path_id] = await tryCatch(database`
        INSERT INTO paths (
          user_id,
          path,
          polygon,
          distance,
          surface
        )
        VALUES (
          ${user.id},
          ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(feature.geometry)}), 4326),
          ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(polygon.geometry)}), 4326),
          ${length},
          ${surface}
        )
        RETURNING id
      `);

      if (insert_error) {
        console.error(insert_error);

        return c.status("Internal Server Error", {
          error: "Failed to create the path",
        });
      }

      const [insert_image_error] = await tryCatch(database`
        INSERT INTO path_images (
          path_id,
          image_url
        )
        VALUES (
          ${path_id[0].id},
          ${path}
        )
      `);

      if (insert_image_error) {
        return c.status("Internal Server Error", {
          error: "Failed to save the path image",
        });
      }

      const [update_error] = await tryCatch(database`
        UPDATE users
        SET score = score + ${Math.floor(length / 10) * (is_regular ? 1.5 : 1)}
        WHERE id = ${user.id}
      `);

      if (update_error) {
        return c.status("Internal Server Error", {
          error: "Failed to update user score",
        });
      }

      return c.status("Created", { success: true });
    },
    {
      body: create_path_schema,
      cookie: z.object({
        token: z.string(),
      }),
    },
  )
  .get(
    "/polygons",
    async (c) => {
      const { bbox } = c.query;

      const [error, data] = await tryCatch<
        {
          id: string;
          polygon: string;
          user_id: string;
          username: string;
          surface: number;
          distance: number;
        }[]
      >(database`
        SELECT 
          paths.id,
          ST_AsGeoJSON(paths.polygon) as polygon,
          paths.user_id,
          users.username,
          paths.surface,
          paths.distance
        FROM paths
        JOIN users ON paths.user_id = users.id
        WHERE ST_Intersects(
          paths.polygon,
          ST_MakeEnvelope(${bbox[0]}, ${bbox[1]}, ${bbox[2]}, ${bbox[3]}, 4326)
        )
      `);

      if (error) {
        return c.status("Internal Server Error", {
          error: "Failed to retrieve polygons",
        });
      }

      const collection: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.map((item) => ({
          type: "Feature",
          id: item.id,
          geometry: JSON.parse(item.polygon),
          properties: {
            user_id: item.user_id,
            username: item.username,
            surface: item.surface,
            distance: item.distance,
          },
        })),
      };

      return collection;
    },
    {
      query: z.object({
        // Bounding box (minLon, minLat, maxLon, maxLat)
        bbox: z.array(z.coerce.number()).length(4),
      }),
    },
  );

export const paths = app;
