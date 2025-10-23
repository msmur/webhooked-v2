import { z } from 'zod';

export const CreateHookSchema = z
    .object({
        name: z.string().min(5).max(30).describe('Name of the Hook'),
        description: z.string().describe('Description of the Hook'),
        correlation_identifier_location: z
            .enum(['header', 'payload'])
            .optional()
            .nullable()
            .describe('Location of correlation identifier'),
        correlation_identifier_field: z
            .string()
            .optional()
            .nullable()
            .describe(
                `
                Field name for correlation identifier.
                If it is in the payload, any valid JSON Path expression can be used.
                If it's not a string, it will be coerced into one
                `,
            ),
    })
    .superRefine((data, ctx) => {
        // Condition 1: If location is null or undefined, the field must also be null or undefined
        if (!data.correlation_identifier_location && data.correlation_identifier_field) {
            ctx.addIssue({
                code: 'custom',
                path: ['correlation_identifier_field'],
                message: 'Correlation identifier field cannot be provided if location is not provided.',
            });
        }

        // Condition 2: If location is provided, the field must also be provided
        if (data.correlation_identifier_location && !data.correlation_identifier_field) {
            ctx.addIssue({
                code: 'custom',
                path: ['correlation_identifier_field'],
                message: 'Correlation identifier field is required when location is provided.',
            });
        }
    });

export type CreateHook = z.infer<typeof CreateHookSchema>;

export const HookSchema = CreateHookSchema.extend({
    id: z.string().describe('Unique identifier for the Hook'),
    created_at: z.instanceof(Date).describe('Creation timestamp'),
    hook_url: z.string().describe('URL to access the Hook'),
});

export type Hook = z.infer<typeof HookSchema>;

export const DerivedHookSchema = CreateHookSchema.extend({
    id: z.string().describe('Unique identifier for the Hook'),
    created_at: z.instanceof(Date).describe('Creation timestamp'),
}).transform((data) => ({
    ...data,
    hook_url: `/api/hooks/${data.id}/webhooks/receive`,
}));

export const HookFilterParamsSchema = z.object({
    limit: z.coerce.number().min(1).max(1000).default(50).describe('Maximum number of Hooks to return'),
    offset: z.coerce.number().nonnegative().optional().default(0).describe('Offset for pagination, starting from 0'),
    id: z.string().optional().describe('Filter by Hook ID'),
    name: z.string().min(1).optional().describe('Filter by Hook name'),
});

export type HookFilterParams = z.infer<typeof HookFilterParamsSchema>;
