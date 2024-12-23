import {saveAs} from 'file-saver'
import moment from 'moment'
import React from 'react'
import {copyToClipboard, EuiBadge, EuiButton, EuiButtonIcon, EuiCode, EuiCopy, EuiDescriptionList, EuiIcon, EuiText} from '@elastic/eui'
import prettyBytes from 'pretty-bytes'
import type {GarFile} from '../backend/gar_apis.ts'

export function FileInfo({file, downloadUrl}: { file?: GarFile, downloadUrl: string }) {
  if (!file) {
    return
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px'}}>
      <EuiText><h2>File info</h2></EuiText>
      <EuiDescriptionList
        compressed
        type="column"
        listItems={[
          {
            title: 'Name',
            description: (
              <span>
                {file.name}{' '}
                <EuiButtonIcon iconType="copy" color="text" onClick={() => copyToClipboard(file.name)}/>
              </span>
            )
          },
          {title: 'Size', description: prettyBytes(Number(file.sizeBytes))},
          {title: 'Created', description: moment(file.createTime).toLocaleString()},
          {title: 'Updated', description: moment(file.updateTime).toLocaleString()},
          {
            title: 'Hashes',
            description: (
              <ul>
                {file.hashes.map(hash => (
                  <div key={hash.type}>
                    <EuiBadge>{hash.type}</EuiBadge>{' '}
                    <EuiCode>{hash.value}</EuiCode>{' '}
                    <EuiButtonIcon iconType="copy" color="text" onClick={() => copyToClipboard(hash.value)}/>
                  </div>
                ))}
              </ul>
            )
          },
          {
            title: 'Actions',
            description: <EuiButton size="s" href={downloadUrl}>Download</EuiButton>
          },
        ]}
      />
    </div>
  )
}