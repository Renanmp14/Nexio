import { createContext, useContext, useState, useEffect } from 'react'
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

const SESSION_KEY = 'nexio-session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function buildInitialState() {
  const saved = loadSession()

  if (saved?.tabs?.length) {
    const tabs = saved.tabs.map((t, i) => ({
      id: Date.now() + i,
      title: t.title || 'Nova Aba',
      url: t.url || '',
      isLoading: false
    }))
    const activeIndex = Math.min(saved.activeIndex ?? 0, tabs.length - 1)
    return {
      tabs,
      activeTab: tabs[Math.max(0, activeIndex)].id,
      theme: saved.theme || 'dark'
    }
  }

  return {
    tabs: [{ id: 1, title: 'Nova Aba', url: '', isLoading: false }],
    activeTab: 1,
    theme: 'dark'
  }
}

export function BrowserProvider({ children }) {
  const initial = buildInitialState()
  const [theme, setTheme] = useState(initial.theme)
  const [activeIcons, setActiveIcons] = useState(DEFAULT_ICONS)
  const [tabs, setTabs] = useState(initial.tabs)
  const [activeTab, setActiveTab] = useState(initial.activeTab)

  const currentTheme = themes[theme] || themes.dark

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab)
    const session = {
      tabs: tabs.map(t => ({ url: t.url, title: t.title })),
      activeIndex: Math.max(0, activeIndex),
      theme
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // ignore storage errors
    }
  }, [tabs, activeTab, theme])

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
    if (tabs.length === 1) {
      setTabs(prev => prev.map(t => t.id === id ? { ...t, url: '', title: 'Nova Aba', isLoading: false } : t))
      return
    }
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
