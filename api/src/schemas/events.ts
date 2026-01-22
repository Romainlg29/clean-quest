import { z } from "zod";

export const create_event_schema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(1024),

  // Address or place name
  location: z.string().max(256),

  start_at: z.number().int().min(0),
});
