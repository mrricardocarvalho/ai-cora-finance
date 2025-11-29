import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './db/migrations',
  // Dialect for drizzle-kit
  dialect: 'postgresql',
  // Driver not specified to keep compatibility with local drizzle-kit versions; use 'dialect' above.
  dbCredentials: {
    url: process.env.DATABASE_URL || ''
  } as any
} as any)
