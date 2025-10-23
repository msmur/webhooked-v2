// src/db/migrations/20240726000000_create_hooks_table.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('hooks')
        .ifNotExists()
        .addColumn('id', 'text', (col) => col.primaryKey().notNull()) // UUIDs stored as TEXT
        .addColumn('name', 'text', (col) => col.unique().notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('correlation_identifier_location', 'text', (col) => col.defaultTo(null)) // 'headers' | 'payload'
        .addColumn('correlation_identifier_field', 'text', (col) => col.defaultTo(null))
        .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // You might want an index on name or status for faster lookups
    await db.schema.createIndex('hooks_name_idx').on('hooks').column('name').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('hooks').execute();
    await db.schema.dropIndex('hooks_name_idx').execute();
}
