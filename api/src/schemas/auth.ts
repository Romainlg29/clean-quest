import { z } from "zod";

export const sign_up_schema = z.object({
  username: z.string().min(3).max(16),
  email: z.email().max(64),
  password: z.string().min(6),
  first_name: z.string().min(1).max(32),
  last_name: z.string().min(1).max(32),
});

export const sign_in_schema = z.object({
  usernameOrEmail: z.string().min(3).max(64),
  password: z.string().min(6),
});
