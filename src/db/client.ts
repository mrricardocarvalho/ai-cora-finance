// Placeholder db client to be replaced with real Drizzle client in Story 1.2/2.2
type DB = {
  insert: (table: unknown) => { values: (v: unknown) => { returning: () => Promise<unknown[]> } }
  select: () => { from: (t: unknown) => { where: (c: unknown) => Promise<unknown[]> } }
}

export const db: DB = {
  insert: () => ({ values: () => ({ returning: async () => [] }) }),
  select: () => ({ from: () => ({ where: async () => [] }) }),
}
