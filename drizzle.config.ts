import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
    out: "./drizzle/dist",
    schema: "./src/models",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    strict: true,
    verbose: true
});
