import { useRef, useEffect } from 'react'
import { useBrowser } from '../context/BrowserContext'
import NavigationBar from './NavigationBar'

export default function WebView() {
  const { tabs, activeTab, updateTab, currentTheme } = useBrowser()
  const webviewRef = useRef(null)
  const activeTabRef = useRef(activeTab)
  const updateTabRef = useRef(updateTab)

  const activeTabData = tabs.find(t => t.id === activeTab)

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  useEffect(() => {
    updateTabRef.current = updateTab
  }, [updateTab])

  useEffect(() => {
    const wv = webviewRef.current
    if (!wv) return

    const onStart = () => updateTabRef.current(activeTabRef.current, { isLoading: true })
    const onStop = () => updateTabRef.current(activeTabRef.current, { isLoading: false })
    const onTitle = (e) => updateTabRef.current(activeTabRef.current, { title: e.title })
    const onUrl = (e) => {
      updateTabRef.current(activeTabRef.current, { url: e.url })
      window.electronAPI?.trackVisitedSite?.(e.url)
    }

    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    wv.addEventListener('page-title-updated', onTitle)
    wv.addEventListener('did-navigate', onUrl)
    wv.addEventListener('did-navigate-in-page', onUrl)
    wv.addEventListener('did-redirect-navigation', onUrl)

    return () => {
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
      wv.removeEventListener('page-title-updated', onTitle)
      wv.removeEventListener('did-navigate', onUrl)
      wv.removeEventListener('did-navigate-in-page', onUrl)
      wv.removeEventListener('did-redirect-navigation', onUrl)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <NavigationBar webviewRef={webviewRef} />

      <div style={{ position: 'relative', flex: 1 }}>
        <webview
          ref={webviewRef}
          src={activeTabData?.url || 'about:blank'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%'
          }}
          allowpopups="true"
        />
        {!activeTabData?.url && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentTheme.bgSecondary,
            color: currentTheme.textMuted,
            gap: '16px',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '64px' }}>🌐</div>
            <p style={{ fontSize: '18px', color: currentTheme.text }}>Nova aba</p>
            <p style={{ fontSize: '14px' }}>Digite uma URL ou pesquise na barra acima</p>
          </div>
        )}
      </div>
    </div>
  )
}