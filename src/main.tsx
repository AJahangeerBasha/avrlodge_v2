import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { AppRouter } from './router/AppRouter'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
        <AppRouter />
    </HelmetProvider>
  </React.StrictMode>
)