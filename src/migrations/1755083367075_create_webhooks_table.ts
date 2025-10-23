// src/db/migrations/20240726000001_create_webhooks_table.ts
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('webhooks')
        .addColumn('id', 'text', (col) => col.primaryKey().notNull()) // UUIDs stored as TEXT
        .addColumn(
            'hook_id',
            'text',
            (col) => col.notNull().references('hooks.id').onDelete('cascade'), // Foreign key
        )
        .addColumn('method', 'text', (col) => col.notNull())
        .addColumn('query', 'jsonb', (col) => col.notNull())
        .addColumn('payload', 'jsonb', (col) => col.notNull())
        .addColumn('headers', 'jsonb', (col) => col.notNull())
        .addColumn('correlation_value', 'text', (col) => col.defaultTo(null))
        .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
        .execute();

    // Index on hook_id for efficient lookups of webhooks for a specific hook
    await db.schema
        .createIndex('webhooks_hook_id_created_at_idx')
        .on('webhooks')
        .columns(['hook_id', 'created_at'])
        .execute();

    await db.schema
        .createIndex('webhooks_hook_id_correlation_created_idx')
        .on('webhooks')
        .columns(['hook_id', 'correlation_value', 'created_at'])
        .execute();

    await db.schema
        .createIndex('webhooks_hook_id_method_created_idx')
        .on('webhooks')
        .columns(['hook_id', 'method', 'created_at'])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('webhooks').execute();
    await db.schema.dropIndex('webhooks_hook_id_idx').execute();
    await db.schema.dropIndex('webhooks_correlation_value_idx').execute();
}
