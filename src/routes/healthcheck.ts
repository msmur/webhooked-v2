import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function healthcheckRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get(
        '/liveness',
        {
            schema: {
                description: 'Liveness check endpoint',
                tags: ['healthcheck'],
                response: {
                    200: z
                        .object({
                            status: z.enum(['ok']).describe('Status of the liveness check'),
                        })
                        .describe('Successful response for liveness check'),
                },
            },
        },
        async (request, reply) => {
            reply.status(200);
            return { status: 'ok' };
        },
    );
}

export default healthcheckRoutes;
