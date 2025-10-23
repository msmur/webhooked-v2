import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { HooksRepository, IHooksRepository } from '../repositories';
import { WebhooksRepository } from '../repositories/webhook';

// --- Extend FastifyInstance with the Kysely property ---
declare module 'fastify' {
    export interface FastifyInstance {
        repositories: {
            hooksRepository: IHooksRepository;
            webhooksRepository: WebhooksRepository;
        };
    }
}

export default fp(
    async (fastify: FastifyInstance) => {
        const hooksRepository = new HooksRepository(fastify.connection, fastify.log);
        const webhooksRepository = new WebhooksRepository(fastify.connection, fastify.log);

        fastify.decorate('repositories', {
            hooksRepository: hooksRepository,
            webhooksRepository: webhooksRepository,
        });

        fastify.log.info('Repositories initialized successfully.');
    },
    {
        name: 'plugin:internal:repositories',
        dependencies: ['plugin:external:kysely'],
    },
);
