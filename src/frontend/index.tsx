import {EuiHorizontalRule, EuiProvider, EuiSpacer} from '@elastic/eui'
import {saveAs} from 'file-saver'
import React from 'react'
import {createRoot} from 'react-dom/client'
import {useFiles, usePackages, useRepos, useVersions} from './api_hooks.ts'
import {FileInfo} from './file_info.tsx'
import {Header} from './header.tsx'
import {useSavedSelection} from './saved_selection.ts'
import {SelectionPane} from './selection_pane.tsx'

import './include_eui_icons'

createRoot(document.getElementById('root')!)
  .render(<App/>)

function App() {
  return (
    <EuiProvider>
      <Header/>
      <Content/>
    </EuiProvider>
  )
}

function Content() {
  const {selection, setSelection} = useSavedSelection()
  const {repos, loading: loadingRepos} = useRepos()
  const {packages, loading: loadingPackages} = usePackages(selection.repo)
  const {versions, loading: loadingVersions} = useVersions(selection.repo, selection.pkg)
  const {files, loading: loadingFiles} = useFiles(selection.repo, selection.pkg, selection.version)

  return (
    <div>
      <div style={{display: 'flex', gap: '16px', overflowX: 'auto'}}>
        <SelectionPane
          header="Repo"
          value={selection.repo}
          options={repos || []}
          loading={loadingRepos}
          minWidth="250px"
          onSelect={repo => setSelection({ repo })}
        />
        <SelectionPane
          header="Package"
          value={selection.pkg}
          options={packages || []}
          loading={loadingPackages}
          minWidth="400px"
          onSelect={pkg => setSelection({ repo: selection.repo, pkg })}
        />
        <SelectionPane
          header="Version"
          value={selection.version}
          options={versions || []}
          loading={loadingVersions}
          minWidth="300px"
          onSelect={version => setSelection({ repo: selection.repo, pkg: selection.pkg, version })}
        />
        <SelectionPane
          header="File"
          value={selection.filename}
          options={files?.map(file => file.name) || []}
          loading={loadingFiles}
          minWidth="500px"
          onSelect={filename => setSelection({ repo: selection.repo, pkg: selection.pkg, version: selection.version, filename })}
        />
      </div>
      {files && selection.filename && (
        <>
          <EuiHorizontalRule/>
          <FileInfo
            file={files.find(file => file.name === selection.filename)!}
            downloadUrl={`/api/repos/${selection.repo}/packages/${selection.pkg}/versions/${selection.version}/files/${selection.filename}/_download`}
          />
        </>
      )}
    </div>
  )
}
