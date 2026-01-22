import { z } from "zod";

export const create_path_schema = z.object({
  coordinates: z.array(z.coerce.number().array().length(2)).min(2),

  // As bytes
  picture: z.array(z.number()),
  format: z.string(),
});
