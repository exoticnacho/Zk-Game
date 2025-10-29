// frontend/src/utils/wagmi-config.ts

import { http, createConfig, connect, disconnect, readContract } from '@wagmi/core';
import { baseSepolia } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { ABI, GAME_CONTRACT_ADDRESS } from './constants';
import type { Score } from './types'; // Asumsi file types.ts sudah ada

// Konfigurasi Wagmi untuk Base Sepolia (Chain ID 84532)
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(), // Untuk MetaMask dan Injected Wallets
    coinbaseWallet(), // Untuk Coinbase Wallet
    // Ganti 'YOUR_WALLETCONNECT_PROJECT_ID' dengan ID dari WalletConnect
    walletConnect({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }) 
  ],
  transports: { [baseSepolia.id]: http() },
});

// Fungsi Koneksi Wallet (Mengganti connectWithSSO)
export const connectWithWallet = () => {
  connect(config, { connector: injected(), chainId: baseSepolia.id });
};

export const disconnectWallet = async () => {
  await disconnect(config);
};

// Fungsi Read-Only Contract (Sama seperti dokumentasi lama, tetapi Wagmi standar)

export async function getPlayerHighScore(playerAddress: `0x${string}`) {
    const data = await readContract(config, {
      abi: ABI,
      address: GAME_CONTRACT_ADDRESS,
      functionName: 'getPlayerScore',
      args: [playerAddress],
    });
    // Menghandle data tuple yang dikembalikan
    return data;
}

export async function getHighScores() {
    const highScores: Score[] = [];
    const data = await readContract(config, {
      abi: ABI,
      address: GAME_CONTRACT_ADDRESS,
      functionName: 'getTopScores',
    });
  
    // Logika mapping data dan padding ke 10 tetap sama
    if (Array.isArray(data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typedData: Score[] = data as any;
  
        typedData.forEach((score) => {
            const newHighScore: Score = {
                player: score.player,
                blocksDestroyed: score.blocksDestroyed,
                timeElapsed: score.timeElapsed,
            };
            highScores.push(newHighScore);
        });
    }
    // ... [Tambahkan logika padding ke 10 di sini jika Anda membutuhkannya] ...
    
    return highScores;
}