import React from 'react'
import ReactDOM from 'react-dom/client'
import Tele from './pages/tele'

const root = document.getElementById('root')
if (!root) throw new Error('Le point de montage #root est introuvable.')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Tele />
  </React.StrictMode>,
)
