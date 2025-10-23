import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ErrorSchema, PaginatedWebhooksSchema, WebhookFilterParamsSchema } from '../schemas';

async function webhookRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get(
        '',
        {
            schema: {
                description: 'Retrieve webhooks with optional filtering and pagination',
                tags: ['webhooks'],
                summary: 'Get Webhooks',
                params: z.object({
                    hook_id: z.string().describe('The Hook ID'),
                }),
                querystring: WebhookFilterParamsSchema,
                response: {
                    200: PaginatedWebhooksSchema,
                    404: ErrorSchema,
                },
            },
        },
        async (request, reply) => {
            const { hook_id } = request.params;
            const params = WebhookFilterParamsSchema.parse(request.query);

            // Check if hook exists (optional, depends on your business logic)
            const hookExists = await app.repositories.hooksRepository.findById(hook_id);

            if (!hookExists) {
                return reply.status(404).send({
                    error: 'Hook not found',
                    message: `Hook with ID ${hook_id} does not exist`,
                });
            }

            const webhookRepository = app.repositories.webhooksRepository;

            const webhooks = await webhookRepository.findByFilter(hook_id, params);

            return reply.status(200).send(webhooks);
        },
    );
}

export default webhookRoutes;
