import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../database/schema";

const sql = neon(process.env.DATABASE_URL!);
const drizzle_ = drizzle({ client: sql });

export function useDrizzle() {
  return drizzle_;
}

export const tables = schema;
