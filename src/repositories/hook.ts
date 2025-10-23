import { Kysely } from 'kysely';
import { v4 } from 'uuid';
import { CreateHook, DerivedHookSchema, Hook, HookFilterParams } from '../schemas';
import { DB } from '../database';
import { FastifyBaseLogger } from 'fastify';

export interface IHooksRepository {
    create(data: CreateHook): Promise<Hook>;
    findById(id: string): Promise<Hook | null>;
    findByFilter(params: HookFilterParams): Promise<Hook[]>;
}

export class HooksRepository implements IHooksRepository {
    private db: Kysely<DB>;
    private logger: FastifyBaseLogger;

    constructor(db: Kysely<DB>, logger: FastifyBaseLogger) {
        this.db = db;
        this.logger = logger;
    }

    async findByFilter(params: HookFilterParams): Promise<Hook[]> {
        let query = this.db.selectFrom('hooks').selectAll();

        if (params.id) {
            query = query.where('id', 'ilike', `%${params.id}%`);
        }

        if (params.name) {
            query = query.where('name', 'ilike', `%${params.name}%`);
        }

        query = query.limit(params.limit);

        if (params.offset > 0) {
            query = query.offset(params.offset);
        }

        const results = await query.orderBy('created_at', 'desc').execute();

        return results.map((result) => {
            return DerivedHookSchema.parse(result);
        });
    }

    async create(data: CreateHook): Promise<Hook> {
        const newHookId = `hook-${v4()}`;
        const now = new Date();

        const result = await this.db
            .insertInto('hooks')
            .values({
                id: newHookId,
                name: data.name,
                description: data.description,
                correlation_identifier_location: data.correlation_identifier_location || null,
                correlation_identifier_field: data.correlation_identifier_field || null,
                created_at: now,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        const parsed = DerivedHookSchema.parse(result);

        this.logger.info(parsed, `New Hook logged with ID: ${parsed.id}`);
        return parsed;
    }

    async findById(id: string): Promise<Hook | null> {
        const result = await this.db.selectFrom('hooks').selectAll().where('id', '=', id).executeTakeFirst();

        if (!result) {
            return null;
        } else {
            return DerivedHookSchema.parse(result);
        }
    }
}
