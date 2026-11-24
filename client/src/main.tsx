import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  let url: string;
  if (typeof input === 'string') url = input;
  else if (input instanceof URL) url = input.href;
  else url = input.url;
  if (!url.includes('/api/')) return originalFetch(input, init);
  const token = localStorage.getItem('token');
  if (!token) return originalFetch(input, init);
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  return originalFetch(input, { ...init, headers });
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
