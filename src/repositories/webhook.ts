import { Kysely } from 'kysely';
import {
    CreateWebhook,
    PaginatedWebhooks,
    WebhookFilterParams,
    WebhookSavedResponse,
    WebhookSavedResponseSchema,
    WebhookSchema,
} from '../schemas';
import { DB } from '../database';
import { FastifyBaseLogger } from 'fastify';
import { v4 } from 'uuid';

export interface IWebhooksRepository {
    create(data: CreateWebhook): Promise<WebhookSavedResponse>;
    findByFilter(hookId: string, params: WebhookFilterParams): Promise<PaginatedWebhooks>;
}

export class WebhooksRepository implements IWebhooksRepository {
    private db: Kysely<DB>;
    private logger: FastifyBaseLogger;

    constructor(db: Kysely<DB>, logger: FastifyBaseLogger) {
        this.db = db;
        this.logger = logger;
    }

    async create(data: CreateWebhook): Promise<WebhookSavedResponse> {
        const newWebhookId = `wh-${v4()}`;
        const now = new Date();

        const result = await this.db
            .insertInto('webhooks')
            .values({
                id: newWebhookId,
                hook_id: data.hook_id,
                payload: data.payload,
                headers: data.headers,
                query: data.query,
                method: data.method,
                correlation_value: data.correlation_value,
                created_at: now,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        const parsed = WebhookSavedResponseSchema.parse(result);

        this.logger.info(`New Webhook logged with ID: ${parsed.id}`);
        return parsed;
    }

    async findByFilter(hookId: string, params: WebhookFilterParams): Promise<PaginatedWebhooks> {
        // First, get the total count of matching records
        let countQuery = this.db.selectFrom('webhooks').select(({ fn }) => [fn.count('id').as('count')]);
        countQuery = countQuery.where('hook_id', '=', hookId);
        if (params.search) {
            countQuery = countQuery.where('correlation_value', 'ilike', `${params.search}%`);
        }
        if (params.method) {
            countQuery = countQuery.where('method', '=', params.method);
        }
        const countResult = await countQuery.executeTakeFirst();
        const total = countResult ? Number(countResult.count) : 0;

        // Then, get the actual data with pagination
        let query = this.db.selectFrom('webhooks').selectAll().orderBy('created_at', 'desc');
        query = query.where('hook_id', '=', hookId);
        if (params.search) {
            query = query.where('correlation_value', 'ilike', `${params.search}%`);
        }
        if (params.method) {
            query = query.where('method', '=', params.method);
        }
        // Apply pagination
        query = query.limit(params.limit);
        if (params.offset > 0) {
            query = query.offset(params.offset);
        }

        const results = await query.execute();

        const data = results.map((webhook) => {
            return WebhookSchema.parse(webhook);
        });

        return {
            data,
            limit: params.limit,
            offset: params.offset,
            total,
        };
    }
}
