import { createContext, useContext, useState } from 'react'
import { themes } from '../themes/themes'

const BrowserContext = createContext()

const DEFAULT_ICONS = {
  back: 'back',
  forward: 'forward',
  reload: 'reload',
  close: 'close',
  minimize: 'minimize',
  maximize: 'maximize',
  newTab: 'newTab',
  closeTab: 'closeTab'
}

export function BrowserProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [activeIcons, setActiveIcons] = useState(DEFAULT_ICONS)
  const [tabs, setTabs] = useState([
    { id: 1, title: 'Nova Aba', url: '', isLoading: false }
  ])
  const [activeTab, setActiveTab] = useState(1)

  const currentTheme = themes[theme]

  const addTab = () => {
    const newTab = {
      id: Date.now(),
      title: 'Nova Aba',
      url: '',
      isLoading: false
    }
    setTabs(prev => [...prev, newTab])
    setActiveTab(newTab.id)
  }

  const closeTab = (id) => {
    if (tabs.length === 1) return
    const idx = tabs.findIndex(t => t.id === id)
    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)
    if (activeTab === id) {
      setActiveTab(newTabs[Math.max(0, idx - 1)].id)
    }
  }

  const updateTab = (id, data) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
  }

  const updateIcon = (key, value) => {
    setActiveIcons(prev => ({ ...prev, [key]: value }))
  }

  return (
    <BrowserContext.Provider value={{
      theme, setTheme,
      currentTheme,
      activeIcons, updateIcon,
      tabs, activeTab, setActiveTab,
      addTab, closeTab, updateTab
    }}>
      {children}
    </BrowserContext.Provider>
  )
}

export const useBrowser = () => useContext(BrowserContext)