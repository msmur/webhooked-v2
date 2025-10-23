import { FileMigrationProvider, Migrator } from 'kysely';
import { promises as fs } from 'fs';
import path, { join } from 'path';
import { FastifyInstance } from 'fastify';

export function addMigrationHook(fastify: FastifyInstance) {
    const migrationFolder = 'src/migrations';

    fastify.addHook('onReady', async () => {
        const migrator = new Migrator({
            db: fastify.connection,
            provider: new FileMigrationProvider({
                fs,
                path,
                migrationFolder: join(process.cwd(), migrationFolder),
            }),
        });

        const { error, results } = await migrator.migrateToLatest();

        results?.forEach((it) => {
            if (it.status === 'Success') {
                fastify.log.info(`Migration "${it.migrationName}" was executed successfully`);
            } else if (it.status === 'Error') {
                fastify.log.error(`Failed to execute migration "${it.migrationName}"`);
            }
        });

        if (error) {
            fastify.log.error('Failed to run database migrations');
            fastify.log.error(error);
            throw new Error('Migration failed');
        } else {
            fastify.log.info('All migrations ran successfully or were already up to date.');
        }
    });
}
