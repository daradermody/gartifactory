import axios from 'axios'
import { $ } from "bun";

const token = Bun.env.ACCESS_TOKEN || await $`gcloud auth print-access-token`.text()

const garApi = axios.create({
  baseURL: `https://artifactregistry.googleapis.com/v1/projects/${Bun.env.PROJECT}/locations/${Bun.env.LOCATION}`,
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})

export async function getRepoNames(): Promise<string[]> {
  const response = await garApi.get<GarRepositoriesResponse>('/repositories?pageSize=999')
  const repositories = response.data.repositories || []
  return repositories
    .filter(repo => repo.mode === 'STANDARD_REPOSITORY')
    .map(repo => repo.name.split('/').at(-1)!)
}

interface GarRepositoriesResponse {
  repositories?: {
    name: string;
    format: 'MAVEN' | 'NPM' | 'DOCKER';
    description: string;
    createTime: string;
    updateTime: string;
    mode: 'STANDARD_REPOSITORY' | 'VIRTUAL_REPOSITORY' | 'REMOTE_REPOSITORY';
    vulnerabilityScanningConfig: unknown;
    satisfiesPzi: boolean;
    remoteRepositoryConfig: unknown;
  }[]
}

export async function getPackages(repo: string): Promise<string[]> {
  const response = await garApi.get<GarPackagesResponse>(
    `/repositories/${repo}/packages`,
    {
      params: {
        pageSize: 99999,
        filter: `name="projects/${Bun.env.PROJECT}/locations/${Bun.env.LOCATION}/repositories/${repo}/packages/*siren*"`
      }
    })
    const packages = response.data.packages || []
    return packages.map(pkg => pkg.name.split('/').at(-1)!)
}

interface GarPackagesResponse {
  packages?: {
    name: string;
    createdTime: string;
    updatedTime: string;
  }[]
}

export async function getVersions(repo: string, pkg: string): Promise<string[]> {
  const response = await garApi.get<GarVersionsResponse>(
    `/repositories/${repo}/packages/${pkg}/versions`,
    {
      params: {
        pageSize: 99999
      }
    })
  const versions = response.data.versions || []
  return versions
    .toSorted((a, b) => a.createdTime > b.createdTime ? -1 : 1)
    .map(version => version.name.split('/').at(-1)!)
}

interface GarVersionsResponse {
  versions?: {
    name: string;
    createdTime: string;
    updatedTime: string;
    metadata: { name: string }
  }[]
}

export async function getFiles(repo: string, pkg: string, version: string): Promise<GarFile[]> {
  const encodedPkg = pkg.replaceAll(/[:\.]/g, '/')
  const response = await garApi.get<GarFilesResponse>(
    `/repositories/${repo}/files`,
    {
      params: {
        pageSize: 99999,
        filter: `name="projects/${Bun.env.PROJECT}/locations/${Bun.env.LOCATION}/repositories/${repo}/files/${encodedPkg}/${version}/*"`
      }
    })
  const files = response.data.files || []
  return files
    .map(file => ({...file, name: file.name.split('%2F').at(-1)!}))
    .filter(file => !file.name.endsWith('.md5') && !file.name.endsWith('.sha1') && !file.name.endsWith('.sha256') && !file.name.endsWith('.sha512'))
}

interface GarFilesResponse {
  files?: GarFile[]
}

export interface GarFile {
  name: string;
  sizeBytes: string;
  hashes: { type: string; value: string }[];
  createTime: string;
  updateTime: string;
  owner: string;
}

export async function downloadFile(repo: string, pkg: string, version: string, file: string) {
  const encodedPkg = pkg.replaceAll(/[:\.]/g, '/')
  return await garApi.get(
    `/repositories/${repo}/files/${encodeURIComponent(`${encodedPkg}/${version}/${file}`)}:download`,
    {
      params: { alt: 'media' },
      responseType: 'stream'
    })
}
