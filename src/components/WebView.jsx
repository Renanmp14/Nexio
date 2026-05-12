import { useRef, useEffect, useState, useCallback, useId } from 'react'
import { useBrowser } from '../context/BrowserContext'
import NavigationBar from './NavigationBar'

function NewTabPage({ theme }) {
  const gradId = useId()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: theme.bgSecondary,
      color: theme.text,
      userSelect: 'none',
      zIndex: 1
    }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72" height="72"
        viewBox="0 0 1024 1024"
        style={{ marginBottom: '16px', filter: `drop-shadow(0 8px 24px ${theme.accent}60)` }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#141e30"/>
            <stop offset="100%" stopColor="#243b55"/>
          </linearGradient>
        </defs>
        <rect x="72" y="72" width="880" height="880" rx="220" fill={`url(#${gradId})`}/>
        <path d="M268 744V280h118l258 301V280h112v464H646L380 433v311H268z" fill="#f5f7ff"/>
      </svg>

      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>Nexio</h1>
      <p style={{ margin: '6px 0 48px', fontSize: '13px', color: theme.textMuted }}>Seu navegador pessoal</p>

      <p style={{ margin: 0, fontSize: '60px', fontWeight: 200, letterSpacing: '-2px', lineHeight: 1 }}>
        {timeStr}
      </p>
      <p style={{ margin: '10px 0 0', fontSize: '13px', color: theme.textMuted, textTransform: 'capitalize' }}>
        {dateStr}
      </p>
    </div>
  )
}

function ErrorPage({ error, onRetry, theme }) {
  const messages = {
    '-105': 'Endereço não encontrado. Verifique se a URL está correta.',
    '-102': 'Conexão recusada. O site pode estar fora do ar.',
    '-106': 'Sem conexão com a internet.',
    '-118': 'Conexão expirou. Tente novamente.'
  }
  const msg = messages[String(error.code)] || 'Não foi possível carregar esta página.'

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: theme.bgSecondary,
      color: theme.text, gap: '16px',
      zIndex: 2
    }}>
      <div style={{ fontSize: '48px' }}>⚠️</div>
      <p style={{ fontSize: '18px', fontWeight: 600 }}>Página não disponível</p>
      <p style={{ fontSize: '13px', color: theme.textMuted, maxWidth: '400px', textAlign: 'center' }}>
        {msg}
      </p>
      <button
        onClick={onRetry}
        style={{
          background: theme.accent, color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '8px 20px', cursor: 'pointer', fontSize: '14px'
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}

function CrashPage({ onReload, theme }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: theme.bgSecondary,
      color: theme.text, gap: '16px',
      zIndex: 2
    }}>
      <div style={{ fontSize: '48px' }}>💥</div>
      <p style={{ fontSize: '18px', fontWeight: 600 }}>Esta aba travou</p>
      <p style={{ fontSize: '13px', color: theme.textMuted }}>
        O processo desta aba encerrou inesperadamente.
      </p>
      <button
        onClick={onReload}
        style={{
          background: theme.accent, color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '8px 20px', cursor: 'pointer', fontSize: '14px'
        }}
      >
        Recarregar aba
      </button>
    </div>
  )
}

function SingleWebView({ tab, isActive, onUpdateTab, onNavStateChange, webviewEls, theme }) {
  const [initialSrc] = useState(tab.url || 'about:blank')
  const [error, setError] = useState(null)
  const [crashed, setCrashed] = useState(false)
  const localRef = useRef(null)

  const onUpdateTabRef = useRef(onUpdateTab)
  const onNavStateChangeRef = useRef(onNavStateChange)
  useEffect(() => { onUpdateTabRef.current = onUpdateTab }, [onUpdateTab])
  useEffect(() => { onNavStateChangeRef.current = onNavStateChange }, [onNavStateChange])

  useEffect(() => {
    const wv = localRef.current
    if (!wv) return

    webviewEls.current[tab.id] = wv

    const updateNav = () => {
      onNavStateChangeRef.current(tab.id, {
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward()
      })
    }

    const onStart = () => {
      onUpdateTabRef.current(tab.id, { isLoading: true })
      setError(null)
    }

    const onStop = () => {
      onUpdateTabRef.current(tab.id, { isLoading: false })
      updateNav()
    }

    const onTitle = (e) => onUpdateTabRef.current(tab.id, { title: e.title })

    const onNavigate = (e) => {
      onUpdateTabRef.current(tab.id, { url: e.url })
      window.electronAPI?.trackVisitedSite?.(e.url)
      updateNav()
      setError(null)
    }

    const onFailLoad = (e) => {
      // -3 = ERR_ABORTED: user navigated away or redirect, not a real error
      if (e.errorCode === -3) return
      setError({ code: e.errorCode, description: e.errorDescription })
      onUpdateTabRef.current(tab.id, { isLoading: false })
    }

    const onCrash = () => {
      setCrashed(true)
      onUpdateTabRef.current(tab.id, { isLoading: false })
    }

    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    wv.addEventListener('page-title-updated', onTitle)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('did-redirect-navigation', onNavigate)
    wv.addEventListener('did-fail-load', onFailLoad)
    wv.addEventListener('render-process-gone', onCrash)
    wv.addEventListener('crashed', onCrash)

    return () => {
      delete webviewEls.current[tab.id]
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
      wv.removeEventListener('page-title-updated', onTitle)
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigate)
      wv.removeEventListener('did-redirect-navigation', onNavigate)
      wv.removeEventListener('did-fail-load', onFailLoad)
      wv.removeEventListener('render-process-gone', onCrash)
      wv.removeEventListener('crashed', onCrash)
    }
  }, [tab.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReload = () => {
    setCrashed(false)
    setError(null)
    localRef.current?.reload()
  }

  const handleRetry = () => {
    setError(null)
    localRef.current?.reload()
  }

  const isNewTab = !tab.url || tab.url === 'about:blank'
  const hideWebview = crashed || !!error

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: isActive ? 'block' : 'none'
    }}>
      <webview
        ref={localRef}
        src={initialSrc}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          visibility: hideWebview ? 'hidden' : 'visible'
        }}
        allowpopups="true"
      />
      {isNewTab && !crashed && !error && <NewTabPage theme={theme} />}
      {crashed && <CrashPage onReload={handleReload} theme={theme} />}
      {!crashed && error && <ErrorPage error={error} onRetry={handleRetry} theme={theme} />}
    </div>
  )
}

export default function WebView() {
  const { tabs, activeTab, updateTab, currentTheme } = useBrowser()
  const webviewEls = useRef({})
  const [navStates, setNavStates] = useState({})

  const updateNavState = useCallback((tabId, patch) => {
    setNavStates(prev => ({ ...prev, [tabId]: { ...prev[tabId], ...patch } }))
  }, [])

  const getActiveWebview = useCallback(() => webviewEls.current[activeTab], [activeTab])

  const activeNavState = navStates[activeTab] || { canGoBack: false, canGoForward: false }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <NavigationBar
        getWebview={getActiveWebview}
        canGoBack={activeNavState.canGoBack}
        canGoForward={activeNavState.canGoForward}
      />

      <div style={{ position: 'relative', flex: 1 }}>
        {tabs.map(tab => (
          <SingleWebView
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTab}
            onUpdateTab={updateTab}
            onNavStateChange={updateNavState}
            webviewEls={webviewEls}
            theme={currentTheme}
          />
        ))}
      </div>
    </div>
  )
}
