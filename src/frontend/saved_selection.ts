import {useEffect, useState} from 'react'

export interface Selection {
  repo?: string;
  pkg?: string;
  version?: string;
  filename?: string;
}

export function useSavedSelection() {
  const savedSelection = localStorage.getItem('selection')
  const [selection, setSelection] = useState<Selection>(savedSelection ? JSON.parse(savedSelection) : {})

  useEffect(() => {
    localStorage.setItem('selection', JSON.stringify(selection))
  }, [selection]);

  return { selection, setSelection }
}