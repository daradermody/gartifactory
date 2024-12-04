interface SelectionPaneProps {
  header: string;
  options: string[];
  value?: string;
  disabled?: boolean;
  onSelect: (option: string) => void
}

export function SelectionPane({header, options, value, disabled, onSelect}: SelectionPaneProps) {
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <span>{header}</span>
      <select size={20} disabled={disabled} style={{minWidth: '200px'}} value={value}>
        {options.map(option => <option key={option} value={option} onClick={() => onSelect(option)}>{option}</option>)}
      </select>
    </div>
  )
}