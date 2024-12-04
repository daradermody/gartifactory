interface Selection {
  repo?: string;
  pkg?: string;
  version?: string;
  filename?: string;
}

export function useSavedSelection() {
  const savedSelection = JSON.parse(localStorage.getItem('previousSelection') || '{}') as Selection

  return {
    savedSelection,
    updateSavedSelection: (selection: Selection) => localStorage.setItem('previousSelection', JSON.stringify(selection))
  }
}