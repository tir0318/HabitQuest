import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/style.css'
import './styles/components.css'
import './styles/animations.css'
import { AuthProvider } from './contexts/AuthContext'
import { StorageProvider } from './contexts/StorageContext'
import { ToastProvider } from './contexts/ToastContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StorageProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </StorageProvider>
    </AuthProvider>
  </React.StrictMode>,
)
