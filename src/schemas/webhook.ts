// Define response schema (you'll need to create these based on your data models)
import { z } from 'zod';

export const WebhookSavedResponseSchema = z.object({
    id: z.string(),
    hook_id: z.string(),
    correlation_value: z.string().nullable(),
    created_at: z.instanceof(Date),
});

export type WebhookSavedResponse = z.infer<typeof WebhookSavedResponseSchema>;

export const CreateWebhookSchema = z.object({
    hook_id: z.string().describe('The Hook ID that received this webhook'),
    payload: z.record(z.string(), z.any()).describe('Arbitrary JSON payload from the webhook'),
    headers: z.record(z.string(), z.string()).describe('HTTP headers from the webhook request'),
    query: z.record(z.string(), z.any()).describe('Query parameters from the webhook request'),
    method: z.string().describe('HTTP method used for the webhook request'),
    correlation_value: z.string().nullable().describe('Extracted correlation identifier value'),
});

export type CreateWebhook = z.infer<typeof CreateWebhookSchema>;

export const WebhookSchema = CreateWebhookSchema.extend({
    id: z.string().describe('Unique identifier for the Webhook'),
    created_at: z.instanceof(Date).describe('Creation timestamp of the Webhook'),
});

export type Webhook = z.infer<typeof WebhookSchema>;

export const WebhookFilterParamsSchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(10).describe('Maximum number of webhooks to return'),
    offset: z.coerce.number().nonnegative().optional().default(0).describe('Offset for pagination, starting from 0'),
    search: z.string().min(1).optional().describe('Search term to filter webhooks by correlation value'),
    method: z.string().optional().describe('Filter webhooks by HTTP method'),
});

export type WebhookFilterParams = z.infer<typeof WebhookFilterParamsSchema>;

export const PaginatedWebhooksSchema = z.object({
    data: z.array(WebhookSchema).describe('Array of Webhooks'),
    limit: z.number().describe('Number of Webhooks returned in this page'),
    offset: z.number().describe('Offset used for pagination'),
    total: z.number().describe('Total number of Webhooks matching the filter'),
});

export type PaginatedWebhooks = z.infer<typeof PaginatedWebhooksSchema>;
