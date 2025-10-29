import type { Address } from 'viem';

export const BRICKLES_ABI = [
    {
        type: 'function',
        name: 'verifyProof',
        inputs: [
            { name: '_publicValues', type: 'bytes', internalType: 'bytes' },
            { name: '_proofBytes', type: 'bytes', internalType: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'getTopScores',
        inputs: [],
        outputs: [{
            name: '',
            type: 'tuple[]',
            internalType: 'struct Brickles.Score[]',
            components: [
                { name: 'player', type: 'address', internalType: 'address' },
                { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
                { name: 'blocksDestroyed', type: 'uint256', internalType: 'uint256' },
                { name: 'timeElapsed', type: 'uint256', internalType: 'uint256' }
            ]
        }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getPlayerScore',
        inputs: [{ name: '_player', type: 'address', internalType: 'address' }],
        outputs: [{
            name: '',
            type: 'tuple',
            internalType: 'struct Brickles.Score',
            components: [
                { name: 'player', type: 'address', internalType: 'address' },
                { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
                { name: 'blocksDestroyed', type: 'uint256', internalType: 'uint256' },
                { name: 'timeElapsed', type: 'uint256', internalType: 'uint256' }
            ]
        }],
        stateMutability: 'view',
    }
] as const;

// Alamat Kontrak Game (Gunakan import.meta.env dengan awalan VITE_)
export const GAME_CONTRACT_ADDRESS: Address = (import.meta.env.VITE_GAME_CONTRACT_ADDRESS as Address) ?? '0xB98B07B80A95f27A89e527785069855ad46b6630';

// URL Paymaster CDP
export const PAYMASTER_URL = import.meta.env.VITE_PAYMASTER_URL ?? 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/qeF54D65QBtH048RRNYTl5q1f5jo4qxe';

// URL Backend Rust
export const HTTP_API_URL = import.meta.env.VITE_HTTP_API_URL ?? 'http://localhost:8000';
export const WS_API_URL = import.meta.env.VITE_WS_API_URL ?? 'ws://localhost:8000';

// Tetapkan ABI untuk digunakan di wagmi-config.ts
export const ABI = BRICKLES_ABI;