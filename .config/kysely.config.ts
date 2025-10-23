import { PostgresDialect } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import pg from 'pg';

const { Pool } = pg;

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
        }),
    }),
    migrations: {
        migrationFolder: 'migrations',
    },
});
