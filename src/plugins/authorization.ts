import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// --- Extend FastifyInstance with the authStrategy property ---
declare module 'fastify' {
    export interface FastifyInstance {
        authStrategy: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

export default fp(
    async (fastify: FastifyInstance) => {
        fastify.decorate('authStrategy', async (request: FastifyRequest, reply: FastifyReply) => {
            const apiKey = request.headers['x-api-key'];

            if (!apiKey) {
                reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Missing API key',
                });
                return;
            }

            if (apiKey !== fastify.config.API_KEY) {
                reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Invalid API key',
                });
                return;
            }
        });
        fastify.log.info('Auth strategy initialized successfully.');
    },
    {
        name: 'plugin:internal:auth_strategy',
    },
);
