import { useRef, useEffect } from 'react'
import { useBrowser } from '../context/BrowserContext'
import NavigationBar from './NavigationBar'

export default function WebView() {
  const { tabs, activeTab, updateTab, currentTheme } = useBrowser()
  const webviewRef = useRef(null)

  const activeTabData = tabs.find(t => t.id === activeTab)

  useEffect(() => {
    const wv = webviewRef.current
    if (!wv) return

    const onStart = () => updateTab(activeTab, { isLoading: true })
    const onStop = () => updateTab(activeTab, { isLoading: false })
    const onTitle = (e) => updateTab(activeTab, { title: e.title })
    const onUrl = (e) => updateTab(activeTab, { url: e.url })

    wv.addEventListener('did-start-loading', onStart)
    wv.addEventListener('did-stop-loading', onStop)
    wv.addEventListener('page-title-updated', onTitle)
    wv.addEventListener('did-navigate', onUrl)

    return () => {
      wv.removeEventListener('did-start-loading', onStart)
      wv.removeEventListener('did-stop-loading', onStop)
      wv.removeEventListener('page-title-updated', onTitle)
      wv.removeEventListener('did-navigate', onUrl)
    }
  }, [activeTab])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <NavigationBar webviewRef={webviewRef} />

      {activeTabData?.url ? (
        <webview
          ref={webviewRef}
          src={activeTabData.url}
          style={{ flex: 1, width: '100%' }}
          allowpopups="true"
        />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: currentTheme.bgSecondary,
          color: currentTheme.textMuted,
          gap: '16px'
        }}>
          <div style={{ fontSize: '64px' }}>🌐</div>
          <p style={{ fontSize: '18px', color: currentTheme.text }}>Nova aba</p>
          <p style={{ fontSize: '14px' }}>Digite uma URL ou pesquise na barra acima</p>
        </div>
      )}
    </div>
  )
}