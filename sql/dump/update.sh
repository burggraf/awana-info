 pg_dump --clean --if-exists --quote-all-identifiers -h db.$1.supabase.co --schema=public -s -U postgres > SCHEMA_DUMP.sql
