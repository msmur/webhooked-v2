import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { envSchema } from '../utils/envs.ts'; // Import your Database interface
import { z } from 'zod';

// --- Extend FastifyInstance with the Kysely property ---
declare module 'fastify' {
    export interface FastifyInstance {
        config: z.infer<typeof envSchema>;
    }
}

export default fp(
    async (fastify: FastifyInstance) => {
        const env = envSchema.parse(process.env);
        fastify.decorate('config', env);
        fastify.log.info('Environment variables loaded successfully.');
    },
    {
        name: 'plugin:internal:env',
    },
);
