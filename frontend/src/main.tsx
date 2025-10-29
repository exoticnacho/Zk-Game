// frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- TAMBAHKAN IMPOR INI ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './utils/wagmi-config'; // Import config Anda

const queryClient = new QueryClient(); // Inisialisasi QueryClient

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* WAGMI PROVIDER HARUS DI LINGKUPI QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
            <App />
        </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);