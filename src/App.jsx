import { Routes, Route } from 'react-router-dom'
import { useBrowser } from './context/BrowserContext'
import TabBar from './components/TabBar'
import WebView from './components/WebView'
import Settings from './pages/Settings'

export default function App() {
  const { currentTheme } = useBrowser()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: currentTheme.bg,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: currentTheme.text
    }}>
      <TabBar />
      <Routes>
        <Route path="/" element={<WebView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}