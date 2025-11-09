import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

// CRITICAL: Import buffer polyfill FIRST before any Solana imports
import './buffer-polyfill'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)