import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CreateWebhookSchema, ErrorSchema, WebhookSavedResponseSchema } from '../schemas';
import { getCorrelationFieldFromHeader, getCorrelationFieldFromPayload } from '../utils/string';

async function receiveRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.route({
        method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
        url: '',
        schema: {
            description: 'Receives a webhook and stores it in the database',
            tags: ['webhooks'],
            summary: 'Receive Webhook',
            params: z.object({
                hook_id: z.string().describe('The Hook ID'),
            }),
            response: {
                201: WebhookSavedResponseSchema,
                400: ErrorSchema,
                404: ErrorSchema,
            },
        },
        handler: async (request, reply) => {
            const { hook_id } = request.params;
            const hooksRepository = app.repositories.hooksRepository;
            const webhooksRepository = app.repositories.webhooksRepository;

            app.log.info(`Received ${request.method} webhook for ${hook_id}`);

            const hook = await hooksRepository.findById(hook_id);

            if (!hook) {
                return reply.status(404).send({
                    error: 'DATA_NOT_FOUND',
                    message: `Hook with id ${hook_id} does not exist`,
                });
            }

            let payload = {};
            if (request.body !== undefined) {
                if (request.headers['content-type'] && request.headers['content-type'].includes('application/json')) {
                    // If content-type is JSON, body should already be parsed
                    if (typeof request.body === 'object' && request.body !== null) {
                        payload = request.body;
                    } else {
                        return reply.status(400).send({
                            error: 'INVALID_BODY',
                            message: 'Request body must be valid JSON',
                        });
                    }
                } else if (request.method === 'GET' || request.method === 'DELETE') {
                    // For GET/DELETE, body is typically not expected
                    payload = {};
                } else {
                    // For other methods without proper content-type, treat as empty
                    payload = {};
                }
            }

            const headers = request.headers;
            const method = request.method;
            const query = request.query || {}; // Extract query parameters

            let correlationValue: string | null = null;

            // Extract correlation identifier based on location
            if (hook.correlation_identifier_location) {
                const correlationLocation = hook.correlation_identifier_location;
                const correlationField = hook.correlation_identifier_field!;

                if (correlationLocation === 'header') {
                    correlationValue = getCorrelationFieldFromHeader(headers, correlationField);
                } else if (correlationLocation === 'payload') {
                    correlationValue = getCorrelationFieldFromPayload(payload, correlationField);
                }
            }

            const webhookData = CreateWebhookSchema.parse({
                hook_id: hook_id,
                payload,
                headers: Object.fromEntries(Object.entries(headers)),
                query: Object.fromEntries(Object.entries(query)),
                correlation_value: correlationValue,
                method: method,
            });

            const savedWebhook = await webhooksRepository.create(webhookData);
            reply.status(201);
            return {
                id: savedWebhook.id,
                hook_id: savedWebhook.hook_id,
                correlation_value: savedWebhook.correlation_value,
                created_at: savedWebhook.created_at,
            };
        },
    });
}

export default receiveRoutes;
