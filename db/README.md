DB Migrations & Supabase
=======================

This folder contains SQL migrations and a sample Drizzle config to manage the `profiles` table and related triggers.

How to run migrations locally (drizzle-kit):

1. Set environment variables in `.env` (copy `.env.example` and fill values).
2. Run `npm run migrate:dev` to generate migration files or follow `drizzle-kit` commands to push.
3. Apply migration to your Supabase project with `drizzle-kit push` or with Supabase dashboard/CLI.

Note: `db/migrations/0001_init_profiles.sql` is included and contains table creation, RLS policies, and trigger function required by Story 1.2.
