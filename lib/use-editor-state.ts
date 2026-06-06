import { useState, useCallback } from 'react'
import { EditorElement, EditorState, ElementType, DEFAULT_ELEMENT_SIZES } from './editor-types'

export function useEditorState(totalPages: number) {
  const [state, setState] = useState<EditorState>({
    elements: [],
    selectedElementId: null,
    totalPages,
    currentPage: 1,
  })

  const addElement = useCallback(
    (type: ElementType, x: number, y: number) => {
      const sizes = DEFAULT_ELEMENT_SIZES[type]
      const newElement: EditorElement = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        page: state.currentPage,
        x,
        y,
        ...sizes,
        rotation: 0,
        zIndex: Math.max(0, ...state.elements.map((e) => e.zIndex)) + 1,
      }
      setState((prev) => ({
        ...prev,
        elements: [...prev.elements, newElement],
        selectedElementId: newElement.id,
      }))
    },
    [state.currentPage, state.elements],
  )

  const updateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }))
  }, [])

  const deleteElement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
    }))
  }, [])

  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedElementId: id,
    }))
  }, [])

  const duplicateElement = useCallback((id: string) => {
    const element = state.elements.find((el) => el.id === id)
    if (!element) return

    const newElement: EditorElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
      x: element.x + 10,
      y: element.y + 10,
      zIndex: Math.max(0, ...state.elements.map((e) => e.zIndex)) + 1,
    }
    setState((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id,
    }))
  }, [state.elements])

  const changeZIndex = useCallback((id: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const element = prev.elements.find((el) => el.id === id)
      if (!element) return prev

      let newZIndex = element.zIndex
      if (direction === 'up') {
        newZIndex = Math.max(...prev.elements.map((e) => e.zIndex)) + 1
      } else {
        newZIndex = Math.min(...prev.elements.map((e) => e.zIndex)) - 1
      }

      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, zIndex: newZIndex } : el,
        ),
      }
    })
  }, [])

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages)),
      selectedElementId: null,
    }))
  }, [])

  const copyElementToPages = useCallback((id: string, targetPages: number[]) => {
    const element = state.elements.find((el) => el.id === id)
    if (!element) return

    const newElements = targetPages.map((page) => ({
      ...element,
      id: Math.random().toString(36).substr(2, 9),
      page,
    }))

    setState((prev) => ({
      ...prev,
      elements: [...prev.elements, ...newElements],
    }))
  }, [state.elements])

  return {
    state,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    duplicateElement,
    changeZIndex,
    setCurrentPage,
    copyElementToPages,
  }
}
