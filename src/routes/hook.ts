import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { CreateHookSchema, ErrorSchema, HookFilterParamsSchema, HookSchema } from '../schemas';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

async function hookRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.post(
        '',
        {
            schema: {
                description: 'Create a new hook with the given configuration',
                tags: ['hooks'],
                summary: 'Create a Webhook',
                body: CreateHookSchema,
                response: {
                    201: HookSchema,
                },
            },
            onRequest: app.auth([app.authStrategy]),
        },
        async (request, reply) => {
            const hookData = request.body;
            const repository = app.repositories.hooksRepository;

            const hook = await repository.create(hookData);
            reply.status(201);
            return hook;
        },
    );

    app.get(
        '',
        {
            schema: {
                description: 'Get all Hooks',
                tags: ['hooks'],
                summary: 'List Hooks',
                querystring: HookFilterParamsSchema,
                response: {
                    200: z.array(HookSchema).describe('List of webhooks'),
                },
            },
        },
        async (request, reply) => {
            const params = HookFilterParamsSchema.parse(request.query);
            const repository = app.repositories.hooksRepository;
            const hooks = await repository.findByFilter(params);

            reply.status(200);
            return hooks;
        },
    );

    app.get(
        '/:id',
        {
            schema: {
                description: 'Get a hook by ID',
                tags: ['hooks'],
                summary: 'Get Hook',
                params: z.object({
                    id: z.string().describe('Hook ID'),
                }),
                response: {
                    200: HookSchema.describe('Webhook details'),
                    404: ErrorSchema.describe('Webhook not found'),
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const repository = app.repositories.hooksRepository;

            const hook = await repository.findById(id);

            if (!hook) {
                reply.status(404);
                return {
                    error: 'Not Found',
                    message: 'Webhook not found',
                };
            }

            return hook;
        },
    );

    // Update a webhook
    // app.put(
    //     '/:id',
    //     {
    //         schema: {
    //             description: 'Update a webhook',
    //             tags: ['hooks'],
    //             summary: 'Update Webhook',
    //             params: z.object({
    //                 id: z.string().describe('Webhook ID'),
    //             }),
    //             body: CreateHookSchema.partial(),
    //             response: {
    //                 200: HookSchema.describe('Updated webhook'),
    //                 404: z
    //                     .object({
    //                         error: z.string(),
    //                         message: z.string(),
    //                     })
    //                     .describe('Webhook not found'),
    //             },
    //         },
    //     },
    //     async (request, reply) => {
    //         const { id } = request.params;
    //         const updateData = request.body;
    //         // Mock response - replace with actual implementation
    //         const webhook = {
    //             name: 'updated webhook',
    //             description: 'An updated webhook',
    //             status: 'active',
    //             expires_at: '2025-08-14',
    //             correlation_identifier_location: 'headers',
    //             correlation_identifier_field: 'x-correlation-id',
    //             ...updateData,
    //             id,
    //             created_at: '2025-08-14T08:25:20.724Z',
    //             updated_at: new Date().toISOString(),
    //             webhooks_url: `https://api.example.com/webhooks/${id}`,
    //         };
    //
    //         return webhook;
    //     },
    // );

    // Delete a webhook
    // app.delete(
    //     '/:id',
    //     {
    //         schema: {
    //             description: 'Delete a webhook',
    //             tags: ['hooks'],
    //             summary: 'Delete Webhook',
    //             params: z.object({
    //                 id: z.string().describe('Hook ID'),
    //             }),
    //             response: {
    //                 204: z.void().describe('Hook deleted successfully'),
    //                 404: z
    //                     .object({
    //                         error: z.string(),
    //                         message: z.string(),
    //                     })
    //                     .describe('Hook not found'),
    //             },
    //         },
    //     },
    //     async (request, reply) => {
    //         const { id } = request.params;
    //
    //         // Mock implementation - replace with actual implementation
    //         reply.status(204);
    //         return;
    //     },
    // );
}

export default hookRoutes;
