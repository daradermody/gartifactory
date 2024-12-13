import { isAxiosError } from 'axios';
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'url';
import type { Request, Response } from '@google-cloud/functions-framework'

import { downloadFile, getFiles, getPackages, getRepoNames, getVersions } from './gar_apis.ts'

export async function main(req: Request, res: Response): Promise<void> {
  if (req.url.startsWith('/api/')) {
    await callApi(req, res)
  } else {
    const path = req.url === '/' ? 'index.html' : req.url
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    res.sendFile(path, { root: join(__dirname, 'public') })
  }
}

async function callApi(req: Request, res: Response): Promise<void> {
  try {
    if (req.method === 'GET' && req.url === '/api/repos') {
      res.send(await getRepoNames())
    } else if (req.method === 'GET' && req.url.match(/^\/api\/repos\/[^/]+\/packages$/)) {
      const [_, repo] = req.url.match(/^\/api\/repos\/([^/]+)\/packages/)!
      res.send(await getPackages(repo))
    } else if (req.method === 'GET' && req.url.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions$/)) {
      const [_, repo, pkg] = req.url.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions/)!
      res.send(await getVersions(repo, pkg))
    } else if (req.method === 'GET' && req.url.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions\/[^/]+\/files$/)) {
      const [_, repo, pkg, version] = req.url.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions\/([^/]+)\/files/)!
      res.send(await getFiles(repo, pkg, version))
    } else if (req.method === 'GET' && req.url.match(/^\/api\/repos\/[^/]+\/packages\/[^/]+\/versions\/[^/]+\/files\/[^/]+\/_download$/)) {
      const [_, repo, pkg, version, filename] = req.url.match(/^\/api\/repos\/([^/]+)\/packages\/([^/]+)\/versions\/([^/]+)\/files\/([^/]+)\/_download/)!
      const response = await downloadFile(repo, pkg, version, filename)
      res.header('Content-Type', response.headers['content-type'] || 'application/octet-stream')
      res.header('Content-Length', response.headers['content-length'] || '')
      res.header('Content-Disposition', response.headers['content-disposition'] || 'inline')
      response.data.pipe(res)
    } else {
      res.status(404)
    }
  } catch (e) {
    console.error('Something went wrong handling API request:')
    if (isAxiosError(e)) {
      console.error(e.toJSON())
    } else {
      console.error(e)
    }
    res.status(500)
  }
}
