// Drizzle ORM connection stub — to be completed in Story 1.2
const connectionString = process.env.DATABASE_URL || ''

export const getDb = async (): Promise<Record<string, unknown> | null> => {
  if (!connectionString) {
    // stubbed: return null or throw in dev
    return null
  }
  // In Story 1.2 we will wire Drizzle connection here with Drizzle ORM
  return { connectionString }
}
