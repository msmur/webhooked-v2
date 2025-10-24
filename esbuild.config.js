const { build } = require('esbuild');
const { copy } = require('esbuild-plugin-copy');

build({
    entryPoints: ['src/app.ts', 'src/migrations/**/*.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'cjs',
    sourcemap: true,
    minify: true,
    external: [], // keep empty unless you want to exclude some libs
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.json': 'json',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.svg': 'file',
        '.woff': 'file',
        '.woff2': 'file',
    },
    plugins: [
        copy({
            resolveFrom: 'cwd',
            assets: [
                {
                    from: ['./node_modules/@fastify/swagger-ui/static/*'],
                    to: ['./dist/static/'], // adjust if your server serves from /static
                },
            ],
        }),
    ],
}).catch(() => process.exit(1));
