import { EuiSelectable, EuiText } from '@elastic/eui';
import React from 'react'

interface SelectionPaneProps {
  header: string;
  options: string[];
  value?: string;
  loading?: boolean;
  minWidth?: `${number}px`;
  onSelect: (option?: string) => void
}

export function SelectionPane({header, options, value, loading, onSelect, minWidth}: SelectionPaneProps) {
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <EuiSelectable
        options={options.map(option => ({
          key: option,
          label: option,
          checked: option === value ? 'on' : undefined,
          css: option === value ? { backgroundColor: 'rgba(54, 162, 239, 0.05)', color: '#36a2ef' } : undefined
        }))}
        onChange={options => onSelect(options.find(option => option.checked === 'on')?.key)}
        singleSelection="always"
        searchable
        isLoading={loading}
        style={{ minWidth }}
        listProps={{
          showIcons: false,
          truncationProps: { truncation: 'middle' },
          windowProps: { height: 400 }
        }}
        searchProps={{ placeholder: `Search ${header.toLowerCase()}s` }}
      >
        {(list, search) => (
          <>
            <EuiText grow={false} style={{ marginBottom: '8px'}}><h3>{header}</h3></EuiText>
            {search}
            {list}
          </>
        )}
      </EuiSelectable>
    </div>
  )
}