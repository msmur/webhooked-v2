import Fastify from 'fastify';
import { ENV, EnvToLoggerConfig } from './utils';
import envPlugin from './plugins/env';
import {
    hasZodFastifySchemaValidationErrors,
    isResponseSerializationError,
    jsonSchemaTransform,
    jsonSchemaTransformObject,
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { addMigrationHook } from './hooks/migrations';
import path from 'path';
import { z, ZodError } from 'zod';

/**
 * Use global environment variables to configure the logger given that we register the envs through plugin afterward
 */
const app = Fastify({
    logger: EnvToLoggerConfig[ENV.NODE_ENV],
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(envPlugin);
app.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
});
app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
        directives: {
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'], // Allows inline scripts
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'], // Allows inline styles
            scriptSrcAttr: ["'unsafe-inline'"], // This allows inline event handlers
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
});
app.register(import('@fastify/swagger'), {
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
    openapi: {
        openapi: '3.1.1',
        info: {
            title: 'Webhooked V2',
            description: 'API Specification for the Webhooked V2 application',
            version: '0.0.1',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        tags: [
            { name: 'healthcheck', description: 'Service healthcheck endpoints' },
            {
                name: 'hooks',
                description: 'Hook management endpoints',
            },
        ],
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    name: 'x-api-key',
                    in: 'header',
                },
            },
        },
    },
});
app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
    },
});
app.register(import('@fastify/auth'));

app.register(import('./plugins/authorization'));
app.register(import('./plugins/kysely'));
app.register(import('./plugins/repositories'));

app.setErrorHandler((err, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
        return reply.code(400).send({
            error: 'INVALID_REQUEST_BODY',
            message: "Request doesn't match the expected schema",
            details: {
                issues: err.validation,
                method: req.method,
                url: req.url,
            },
        });
    }

    if (err instanceof ZodError) {
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: z.prettifyError(err) || 'An unexpected error occurred',
        });
    }

    if (isResponseSerializationError(err)) {
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: "Response doesn't match the schema",
            details: {
                issues: err.cause.issues,
                method: err.method,
                url: err.url,
            },
        });
    }

    app.log.error(err, 'An unexpected error occurred');
    return reply.code(500).send({
        error: 'Internal Server Error',
        message: `An unexpected error occurred: ${err.message || 'Unknown error'}`,
    });
});

addMigrationHook(app);

app.register(import('./routes/healthcheck'), {
    prefix: '/api/healthcheck',
});

app.register(import('./routes/hook'), {
    prefix: '/api/hooks',
});

app.register(import('./routes/webhook'), {
    prefix: '/api/hooks/:hook_id/webhooks',
});

app.register(import('./routes/receive'), {
    prefix: '/api/hooks/:hook_id/webhooks/receive',
});

app.register(import('@fastify/static'), {
    root: path.join(__dirname, '../static'),
    prefix: '/',
});

app.get('/hooks/:id/webhooks', async (request, reply) => {
    return reply.sendFile('hook-view/index.html', path.join(__dirname, 'templates'));
});

/**
 * Run the server!
 */
const start = async () => {
    await app.ready();

    try {
        await app.listen({ port: 3000 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
