import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { Kysely, PostgresDialect } from 'kysely'; // Import KyselyConfig // Import your Database interface
import { DB } from '../database';
import { Pool } from 'pg';

// --- Extend FastifyInstance with the Kysely property ---
declare module 'fastify' {
    export interface FastifyInstance {
        connection: Kysely<DB>; // The name of your decorated property, using your Database type
    }
}

// --- The Fastify Plugin ---
export default fp(
    async (fastify: FastifyInstance) => {
        const dialect = new PostgresDialect({
            pool: new Pool({
                connectionString: fastify.config.DATABASE_URL,
            }),
        });

        const dbInstance = new Kysely<DB>({ dialect });

        fastify.decorate('connection', dbInstance);
        fastify.log.info('Kysely connection instantiated successfully.');

        fastify.addHook('onClose', async (instance) => {
            if (instance.connection) {
                fastify.log.info('Closing Kysely database connection...');
                await instance.connection.destroy();
                fastify.log.info('Kysely database connection closed.');
            }
        });
    },
    {
        name: 'plugin:external:kysely',
        dependencies: ['plugin:internal:env'],
    },
);
