
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Add a loading animation
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
