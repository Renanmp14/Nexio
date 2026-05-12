import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrowser } from '../context/BrowserContext'
import { Icons } from '../icons/CustomIcons'

export default function NavigationBar({ getWebview, canGoBack, canGoForward }) {
  const { currentTheme, activeIcons, tabs, activeTab, updateTab } = useBrowser()
  const [inputUrl, setInputUrl] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const navigate = useNavigate()

  const activeTabData = tabs.find(t => t.id === activeTab)

  // Update URL bar when switching tabs (always override)
  useEffect(() => {
    setInputUrl(activeTabData?.url || '')
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL bar when the page navigates, but not while the user is typing
  useEffect(() => {
    if (!isFocused) {
      setInputUrl(activeTabData?.url || '')
    }
  }, [activeTabData?.url]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.includes('.') && !url.includes(' ')) return `https://${url}`
    return `https://www.google.com/search?q=${encodeURIComponent(url)}`
  }

  const handleNavigate = (e) => {
    e.preventDefault()
    const url = formatUrl(inputUrl)
    if (!url) return
    const wv = getWebview()
    if (wv) {
      wv.loadURL(url)
    }
    updateTab(activeTab, { url, title: 'Carregando...' })
    setInputUrl(url)
  }

  const handleBack = () => { if (canGoBack) getWebview()?.goBack() }
  const handleForward = () => { if (canGoForward) getWebview()?.goForward() }
  const handleReload = () => getWebview()?.reload()

  const btnStyle = (color) => ({
    background: 'none',
    border: 'none',
    color: color || currentTheme.textMuted,
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    transition: 'all 0.2s',
    flexShrink: 0
  })

  const navBtnStyle = (disabled) => ({
    ...btnStyle(),
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? 'default' : 'pointer'
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: currentTheme.bg,
      padding: '8px 12px',
      gap: '8px',
      borderBottom: `1px solid ${currentTheme.border}`
    }}>
      {/* Window controls */}
      <button
        onClick={() => window.electronAPI?.close()}
        style={btnStyle(currentTheme.accent)}
        title="Fechar"
        onMouseEnter={e => e.currentTarget.style.background = currentTheme.hover}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ width: '18px', height: '18px' }}>{Icons[activeIcons.close]}</div>
      </button>
      <button
        onClick={() => window.electronAPI?.minimize()}
        style={btnStyle()}
        title="Minimizar"
        onMouseEnter={e => e.currentTarget.style.background = currentTheme.hover}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ width: '18px', height: '18px' }}>{Icons[activeIcons.minimize]}</div>
      </button>
      <button
        onClick={() => window.electronAPI?.maximize()}
        style={btnStyle()}
        title="Expandir"
        onMouseEnter={e => e.currentTarget.style.background = currentTheme.hover}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ width: '18px', height: '18px' }}>{Icons[activeIcons.maximize]}</div>
      </button>

      <div style={{ width: '1px', height: '24px', background: currentTheme.border, margin: '0 4px' }} />

      {/* Navigation */}
      <button
        onClick={handleBack}
        style={navBtnStyle(!canGoBack)}
        title="Voltar"
        onMouseEnter={e => { if (canGoBack) e.currentTarget.style.background = currentTheme.hover }}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ width: '18px', height: '18px' }}>{Icons[activeIcons.back]}</div>
      </button>
      <button
        onClick={handleForward}
        style={navBtnStyle(!canGoForward)}
        title="Avançar"
        onMouseEnter={e => { if (canGoForward) e.currentTarget.style.background = currentTheme.hover }}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ width: '18px', height: '18px' }}>{Icons[activeIcons.forward]}</div>
      </button>
      <button
        onClick={handleReload}
        style={btnStyle()}
        title="Recarregar"
        onMouseEnter={e => e.currentTarget.style.background = currentTheme.hover}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{ width: '18px', height: '18px' }}>{Icons[activeIcons.reload]}</div>
      </button>

      {/* URL Bar */}
      <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            background: currentTheme.input,
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '20px',
            padding: '0 14px',
            gap: '8px',
            transition: 'border-color 0.2s'
          }}
        >
          <div style={{ width: '14px', height: '14px', color: currentTheme.textMuted, flexShrink: 0 }}>
            {Icons.lock}
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onFocus={e => {
              setIsFocused(true)
              e.target.parentElement.style.borderColor = currentTheme.accent
              e.target.select()
            }}
            onBlur={e => {
              setIsFocused(false)
              e.target.parentElement.style.borderColor = currentTheme.border
            }}
            placeholder="Pesquisar ou digitar URL..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: currentTheme.text,
              fontSize: '14px',
              padding: '8px 0'
            }}
          />
        </div>
      </form>

      {/* Settings */}
      <button
        onClick={() => navigate('/settings')}
        style={btnStyle()}
        title="Configurações"
        onMouseEnter={e => { e.currentTarget.style.background = currentTheme.hover; e.currentTarget.style.color = currentTheme.accent }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = currentTheme.textMuted }}
      >
        <div style={{ width: '20px', height: '20px' }}>{Icons.settings}</div>
      </button>
    </div>
  )
}
