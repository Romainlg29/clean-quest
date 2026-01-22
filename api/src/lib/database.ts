import { tryCatch } from "../utils/try-catch";
import { SQL } from "bun";
import { readdir } from "node:fs/promises";

export const database = new SQL({
  adapter: "postgres",
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

export const migrate = async () => {
  const dir = ".database";

  // List the migration files
  const files = await readdir(dir);

  // Sort files to ensure they are applied in order (0000.sql -> 9999.sql)
  const sorted = files.sort();

  for (const file of sorted) {
    // Read the migration file
    const [migration_error, migration] = await tryCatch(
      Bun.file(`${dir}/${file}`).text(),
    );

    if (migration_error) {
      throw new Error(
        `Failed to read migration file ${file}: ${migration_error}`,
      );
    }

    // Apply the migration
    const [error] = await tryCatch(database.unsafe(`${migration}`));

    if (error) {
      throw new Error(`Failed to apply migration file ${file}: ${error}`);
    }
  }

  console.log("Database migrated successfully.");
};
