import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


import './index.css'
import HighlightChanges from './HighlightChanges'


createRoot(document.getElementById('root')).render(
  <StrictMode>

    <div>
     <HighlightChanges/> 
    </div>

  </StrictMode>,
)
