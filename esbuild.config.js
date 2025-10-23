const { build } = require('esbuild');

build({
    entryPoints: ['src/app.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'cjs',
    sourcemap: true,
    minify: true, // Set to true for production
    external: [],
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
}).catch(() => process.exit(1));
