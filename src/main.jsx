import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { BrowserProvider } from './context/BrowserContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <BrowserProvider>
        <App />
      </BrowserProvider>
    </HashRouter>
  </React.StrictMode>
)