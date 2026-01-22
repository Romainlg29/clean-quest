import Elysia from "elysia";
import { tryCatch } from "../utils/try-catch";
import { database } from "../lib/database";
import jwt from "@elysiajs/jwt";
import { sign_in_schema, sign_up_schema } from "../schemas/auth";
import { z } from "zod";

const app = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_HASH_KEY ?? "default",
      exp: "7d",
    }),
  )

  .post(
    "sign-up",
    async (c) => {
      // Retrieve the body
      const { first_name, last_name, username, email, password } = c.body;

      // Check if the username or email already exists
      const [exists_error, existing_users] = await tryCatch(
        database`
            SELECT * FROM users
            WHERE username = ${username} OR email = ${email};
        `,
      );

      if (exists_error) {
        return c.status("Internal Server Error", {
          message: "Error while checking existing users.",
        });
      }

      if (existing_users.length > 0) {
        return c.status("Conflict", {
          message: "Username or email already exists.",
        });
      }

      // Salt and hash the password
      const [hash_error, hash] = await tryCatch(Bun.password.hash(password));

      if (hash_error) {
        return c.status("Internal Server Error", {
          message: "Error while hashing the password.",
        });
      }

      // Insert the user into the database
      const [insert_error, user_id] = await tryCatch(
        database`
            INSERT INTO users (
                first_name,
                last_name,
                username,
                email,
                password
            )
            VALUES (
                ${first_name},
                ${last_name},
                ${username},
                ${email},
                ${hash}
            )
            RETURNING id;
        `,
      );

      if (insert_error) {
        return c.status("Internal Server Error", {
          message: "Error while creating the user.",
        });
      }

      // Sign a JWT token
      const value = await c.jwt.sign({ id: user_id[0].id });

      // Set the token as an HttpOnly cookie
      c.cookie.token.set({
        value,
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: (process.env.COOKIE_SAME_SITE as never) ?? "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Return success response
      return c.status("Created");
    },
    {
      body: sign_up_schema,
    },
  )
  .post(
    "sign-in",
    async (c) => {
      const { usernameOrEmail, password } = c.body;

      // Retrieve the user from the database
      const [user_error, users] = await tryCatch(
        database`
            SELECT * FROM users
            WHERE username = ${usernameOrEmail} OR email = ${usernameOrEmail};
        `,
      );

      if (user_error || users.length === 0) {
        return c.status("Unauthorized", {
          message: "Invalid username/email or password.",
        });
      }

      const user = users[0];

      // Verify the password
      const [verify_error, is_valid] = await tryCatch(
        Bun.password.verify(password, user.password),
      );

      if (verify_error || !is_valid) {
        return c.status("Unauthorized", {
          message: "Invalid username/email or password.",
        });
      }

      // Sign a JWT token
      const value = await c.jwt.sign({ id: user.id });

      // Set the token as an HttpOnly cookie
      c.cookie.token.set({
        value,
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: (process.env.COOKIE_SAME_SITE as never) ?? "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Return success response
      return c.status("OK");
    },
    {
      body: sign_in_schema,
    },
  )
  .post(
    "log-out",
    (c) => {
      // Remove the token cookie
      c.cookie.token.remove();

      return c.status("OK");
    },
    {
      cookie: z.object({
        token: z.string(),
      }),
    },
  )
  .post(
    "verify",
    async (c) => {
      // Verify the JWT token
      const isValid = await c.jwt.verify(c.cookie.token.value);

      if (!isValid) {
        // Remove invalid token
        c.cookie.token.remove();

        return c.status("Unauthorized", { message: "Invalid token." });
      }

      return c.status("OK");
    },
    {
      cookie: z.object({
        token: z.string(),
      }),
    },
  );

export const auth = app;
