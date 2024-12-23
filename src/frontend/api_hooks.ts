import axios from 'axios'
import {useEffect, useState} from 'react'
import type {GarFile} from '../backend/gar_apis.ts'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Accept': 'application/json' }
})

export function useRepos() {
  const { data: repos, loading, error } = useAsync(async () => {
    const response = await api.get<string[]>('/repos')
    return response.data
  })
  return {repos, loading, error}
}

export function usePackages(repo?: string) {
  const { data: packages, loading, error } = useAsync(async () => {
    if (repo) {
      const response = await api.get<string[]>(`/repos/${repo}/packages`)
      return response.data
    }
  }, [repo])
  return {packages, loading, error}
}

export function useVersions(repo?: string, pkg?: string) {
  const { data: versions, loading, error } = useAsync(async () => {
    if (repo && pkg) {
      const response = await api.get<string[]>(`/repos/${repo}/packages/${pkg}/versions`)
      return response.data
    }
  }, [repo, pkg])
  return {versions, loading, error}
}

export function useFiles(repo?: string, pkg?: string, version?: string) {
  const { data: files, loading, error } = useAsync(async () => {
    if (repo && pkg && version) {
      const response = await api.get<GarFile[]>(`/repos/${repo}/packages/${pkg}/versions/${version}/files`)
      return response.data
    }
  }, [repo, pkg, version])
  return {files, loading, error}
}

function useAsync<T>(fn: () => Promise<T>, deps: any[] = []): { data?: T; loading: boolean; error?: Error } {
  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  useEffect(() => {
    setLoading(true)
    fn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [...deps, setData, setError, setLoading])

  return { data, loading, error }
}