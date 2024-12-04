import prettyBytes from 'pretty-bytes'
import type {GarFile} from '../backend/gar_apis.ts'

export function FileInfo({file, onDownload}: { file?: GarFile, onDownload(): void }) {
  if (!file) {
    return
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
      <div>
        <div>File info</div>
        <ul>
          <li>Name: {file.name}</li>
          <li>Size: {prettyBytes(Number(file.sizeBytes))}</li>
          <li>Created: {file.createTime}</li>
          <li>Updated: {file.updateTime}</li>
          <li>Hashes:
            <ul>
              {file.hashes.map(hash => <li key={hash.type}>{hash.type}: <code style={{}}>{hash.value}</code></li>)}
            </ul>
          </li>
        </ul>
      </div>
      <div>
        <div>Actions</div>
        <button onClick={onDownload}>Download</button>
      </div>
    </div>
  )
}