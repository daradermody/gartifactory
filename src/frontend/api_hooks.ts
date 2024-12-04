import axios from 'axios'
import {useEffect, useState} from 'react'
import type {GarFile} from '../backend/gar_apis.ts'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Accept': 'application/json' }
})

export function useRepos() {
  const [repos, setRepos] = useState<string[] | undefined>()

  useEffect(() => {
    api.get<string[]>('/repos')
      .then(response => setRepos(response.data))
  }, [setRepos])

  return {repos}
}

export function usePackages(repo?: string) {
  const [packages, setPackages] = useState<string[] | undefined>()

  useEffect(() => {
    if (repo) {
      api.get<string[]>(`/repos/${repo}/packages`)
        .then(response => setPackages(response.data))
    } else {
      setPackages(undefined)
    }
  }, [repo, setPackages])

  return {packages}
}

export function useVersions(repo?: string, pkg?: string) {
  const [versions, setVersions] = useState<string[] | undefined>()

  useEffect(() => {
    if (repo && pkg) {
      api.get<string[]>(`/repos/${repo}/packages/${pkg}/versions`)
        .then(response => setVersions(response.data))
    } else {
      setVersions(undefined)
    }
  }, [repo, pkg, setVersions])

  return {versions}
}

export function useFiles(repo?: string, pkg?: string, version?: string) {
  const [files, setFiles] = useState<GarFile[] | undefined>()

  useEffect(() => {
    if (repo && pkg && version) {
      api.get<GarFile[]>(`/repos/${repo}/packages/${pkg}/versions/${version}/files`)
        .then(response => setFiles(response.data))
    } else {
      setFiles(undefined)
    }
  }, [repo, pkg, version, setFiles])

  return {files}
}
