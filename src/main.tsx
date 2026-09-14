import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { verifyCurrentAuthUserStreak } from './services/supabaseData';

// Expose verification function to window for manual testing in browser console
(window as any).verifyCurrentAuthUserStreak = verifyCurrentAuthUserStreak;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
