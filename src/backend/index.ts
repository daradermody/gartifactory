import { isAxiosError } from 'axios';
import {downloadFile, getFiles, getPackages, getRepoNames, getVersions} from './gar_apis.ts'

Bun.serve({
  static: {
    '/': new Response(await Bun.file("build/public/index.html").bytes(), { headers: { "Content-Type": "text/html" } })
  },
  async fetch(req) {
    const {pathname} = new URL(req.url)
    if (pathname.startsWith('/api/')) {
      return await callApi(req)
    } else {
      return await getStaticFile(pathname)
    }
  },
});

async function getStaticFile(pathname: string): Promise<Response> {
  const asset = Bun.file(`build/public/${pathname}`)
  if (await asset.exists()) {
    return new Response(asset)
  } else {
    return new Response('Not found', { status: 404 })
  }
}

async function callApi(req: Request): Promise<Response> {
  const {pathname} = new URL(req.url)
  try {
    if (req.method === 'GET' && pathname === '/api/repos') {
      return Response.json(await getRepoNames())
    }
    if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages$/)) {
      const [_, repo] = pathname.match(/^\/api\/repos\/([^/]+)\/packages/)!
      return Response.json(await getPackages(repo))
    }
    if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions$/)) {
      const [_, repo, pkg] = pathname.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions/)!
      return Response.json(await getVersions(repo, pkg))
    }
    if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions\/[^/]+\/files$/)) {
      const [_, repo, pkg, version] = pathname.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions\/([^/]+)\/files/)!
      return Response.json(await getFiles(repo, pkg, version))
    }
    if (req.method === 'GET' && pathname.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions\/[^/]+\/files\/[^/]+\/_download$/)) {
      const [_, repo, pkg, version, filename] = pathname.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions\/([^/]+)\/files\/([^/]+)\/_download/)!
      const response = await downloadFile(repo, pkg, version, filename)
      return new Response(response.data, {
        status: 200,
        headers: {
          "Content-Type": response.headers["content-type"] || "application/octet-stream",
          "Content-Length": response.headers["content-length"] || "",
          "Content-Disposition": response.headers["content-disposition"] || "inline",
        }
      })
    }
    else {
      return new Response('Not found', {status: 404})
    }
  } catch (e) {
    console.error('Something went wrong handling API request:')
    if (isAxiosError(e)) {
      console.error(e.toJSON())
    } else {
      console.error(e)
    }
    throw e
  }
}