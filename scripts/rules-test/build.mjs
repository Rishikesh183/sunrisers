import { build } from 'esbuild';
const [entry, stub, out] = process.argv.slice(2);
await build({
  entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error',
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
  plugins: [{ name: 'stub-firebase', setup(b) { b.onResolve({ filter: /(^|\/)firebase(\.js)?$/ }, (a) => (a.path.startsWith('.') ? { path: stub } : undefined)); } }],
});
