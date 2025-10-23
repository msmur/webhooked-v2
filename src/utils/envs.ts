import { z } from 'zod';

export const envSchema = z.object({
    ENVIRONMENT: z.enum(['development', 'production']).default('development'),
    SERVICE_NAME: z.string().default('Webhooked-v2'),
    DATABASE_URL: z.url().nonoptional(),
    API_KEY: z.string().min(1),
});

export const ENV = envSchema.parse(process.env);
