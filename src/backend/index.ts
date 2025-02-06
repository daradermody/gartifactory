import { $, ShellError } from 'bun';
import { resolve } from 'node:path';
import { isAxiosError } from 'axios';

import { downloadFile, getFiles, getPackages, getRepoNames, getVersions } from './gar_apis.ts';

try {
  await $`bun run build:frontend`.quiet()
} catch(e) {
  console.error((e as ShellError).stderr.toString())
  process.exit((e as ShellError).exitCode)
}

Bun.serve({
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const res = pathname.startsWith('/api/') ? await callApi(req) : await getStaticFile(pathname);
    console.log(`${req.method.padEnd(4)} | ${res.status} | ${pathname}`);
    return res
  },
});
console.log('Serving on http://localhost:3000');

async function getStaticFile(pathname: string): Promise<Response> {
  const path = pathname === '/' ? '/index.html' : pathname;
  const asset = Bun.file(resolve(import.meta.dirname, `../../build/public${path}`));
  if (await asset.exists()) {
    return new Response(asset);
  } else {
    return new Response('Not found', { status: 404 });
  }
}

async function callApi(req: Request): Promise<Response> {
  try {
    const { pathname } = new URL(req.url);
    if (req.method === 'GET' && pathname === '/api/repos') {
      return Response.json(await getRepoNames());
    } else if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages$/)) {
      const [_, repo] = pathname.match(/^\/api\/repos\/([^/]+)\/packages/)!;
      return Response.json(await getPackages(repo));
    } else if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions$/)) {
      const [_, repo, pkg] = pathname.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions/)!;
      return Response.json(await getVersions(repo, pkg));
    } else if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions\/[^/]+\/files$/)) {
      const [_, repo, pkg, version] = pathname.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions\/([^/]+)\/files/)!;
      return Response.json(await getFiles(repo, pkg, version));
    } else if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions\/[^/]+\/files\/[^/]+\/_download$/)) {
      const [_, repo, pkg, version, filename] = pathname.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions\/([^/]+)\/files\/([^/]+)\/_download/)!;
      const response = await downloadFile(repo, pkg, version, filename);
      return new Response(response.data, {
        headers: {
          'Content-Type': response.headers['content-type'] || 'application/octet-stream',
          'Content-Length': response.headers['content-length'] || '',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    } else {
      return new Response(null, { status: 404 });
    }
  } catch (e) {
    console.error('Something went wrong handling API request:');
    if (isAxiosError(e)) {
      console.error(e.toJSON());
    } else {
      console.error(e);
    }
    return new Response(null, { status: 500 });
  }
}
