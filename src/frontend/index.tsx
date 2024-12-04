import {saveAs} from 'file-saver'
import {useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'

import type {GarFile} from '../backend/gar_apis.ts'
import {useFiles, usePackages, useRepos, useVersions} from './api_hooks.ts'
import {FileInfo} from './file_info.tsx'
import {Header} from './header.tsx'
import {useSavedSelection} from './saved_selection.ts'
import {SelectionPane} from './selection_pane.tsx'

createRoot(document.getElementById('root')!)
  .render(<App/>)

function App() {
  return (
    <>
      <Header/>
      <Content/>
    </>
  )
}


function Content() {
  const {savedSelection, updateSavedSelection} = useSavedSelection()
  const {repos} = useRepos()
  const [repo, setRepo] = useState<string | undefined>(savedSelection.repo)
  const {packages} = usePackages(repo)
  const [pkg, setPkg] = useState<string | undefined>(savedSelection.pkg)
  const {versions} = useVersions(repo, pkg)
  const [version, setVersion] = useState<string | undefined>(savedSelection.version)
  const {files} = useFiles(repo, pkg, version)
  const [filename, setFilename] = useState<GarFile['name'] | undefined>(savedSelection.filename)

  useEffect(() => updateSavedSelection({ repo, pkg, version, filename }), [repo, pkg, version, filename])

  function handleRepoChange(repo: string) {
    setFilename(undefined)
    setVersion(undefined)
    setPkg(undefined)
    setRepo(repo)
  }

  function handlePkgChange(pkg: string) {
    setFilename(undefined)
    setVersion(undefined)
    setPkg(pkg)
  }

  function handleVersionChange(version: string) {
    setFilename(undefined)
    setVersion(version)
  }

  async function downloadFile() {
    saveAs(`/api/repos/${repo}/packages/${pkg}/versions/${version}/files/${filename}/_download`, filename)
  }

  return (
    <div>
      <div style={{display: 'flex', gap: '16px'}}>
        <SelectionPane header="Repo" value={repo} options={repos || []} disabled={!repos} onSelect={handleRepoChange}/>
        <SelectionPane header="Package" value={pkg} options={packages || []} disabled={!packages} onSelect={handlePkgChange}/>
        <SelectionPane header="Version" value={version} options={versions || []} disabled={!versions} onSelect={handleVersionChange}/>
        <SelectionPane header="File" value={filename} options={files?.map(file => file.name) || []} disabled={!files} onSelect={setFilename}/>
      </div>
      {files && filename && <FileInfo file={files.find(file => file.name === filename)!} onDownload={downloadFile}/>}
    </div>
  )
}
