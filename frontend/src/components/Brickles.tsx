// frontend/src/components/Brickles.tsx

import { useAccount } from 'wagmi';
import { useWriteContracts, useCapabilities } from 'wagmi/experimental';
import { useMemo, useState } from 'react';
import { PAYMASTER_URL, ABI, GAME_CONTRACT_ADDRESS } from '../utils/constants';
import { submitProof } from '../utils/proofs'; // Impor fungsi backend Rust Anda
import { baseSepolia } from 'wagmi/chains';
import Spinner from './Spinner'; // Asumsi Spinner adalah default export
import type { Action } from '../utils/types'; // Asumsi type Action ada

// Definisikan tipe state game
interface GameState {
    actionLog: Action[]; 
    blocksDestroyed: number;
    timeElapsed: number;
}


export function Brickles() {
    // PERBAIKAN: Definisikan state gameData yang menyebabkan error sebelumnya
    const [gameData, setGameData] = useState<GameState>({ 
        actionLog: [] as Action[], 
        blocksDestroyed: 0, 
        timeElapsed: 0 
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { address, isConnected, chain } = useAccount();

    // 1. Inisialisasi hook transaksi EIP-4337
    const { writeContracts, isPending } = useWriteContracts();
    
    // 2. Dapatkan Paymaster Capabilities dari wallet
    const { data: availableCapabilities } = useCapabilities({ account: address });

    const capabilities = useMemo(() => {
        if (!availableCapabilities || !address || chain?.id !== baseSepolia.id) return {};
        const capabilitiesForChain = availableCapabilities[baseSepolia.id];
        
        // Logika Paymaster CDP Anda
        if (capabilitiesForChain?.['paymasterService']?.supported) {
            return {
                paymasterService: {
                    url: PAYMASTER_URL, // URL PAYMASTER CDP Anda
                },
            };
        }
        return {};
    }, [availableCapabilities, address, chain]);


    const handleSaveOnChain = async (actionLog: Action[], blocksDestroyed: number, timeElapsed: number) => {
        if (!address || !isConnected) {
            alert('Please connect your wallet first.');
            return;
        }

        setIsSaving(true);
        setTxStatus('loading');

        try {
            // Panggil backend Rust untuk generate proof
            const proofData = await submitProof(actionLog, blocksDestroyed, timeElapsed);
            
            if (!proofData) {
                alert('Proof generation failed. Check your backend API.');
                setTxStatus('error');
                return;
            }

            // 3. Kirim Transaksi Gasless (EIP-4337)
            writeContracts({
                contracts: [{
                    address: GAME_CONTRACT_ADDRESS,
                    abi: ABI,
                    functionName: 'verifyProof',
                    args: [proofData.public_values, proofData.proof_bytes],
                }],
                capabilities, // INI MENGIRIM PAYMASTER URL KE WALLET
            }, {
                onSuccess: (hash) => {
                    setTxStatus('success');
                    alert(`Score submitted! Tx Hash: ${hash}`);
                },
                onError: (error) => {
                    setTxStatus('error');
                    console.error('Transaction failed:', error);
                    alert(`Transaction failed: ${error.message}`);
                }
            });

        } catch (error) {
            setTxStatus('error');
            console.error('Proof submission failed:', error);
            alert('Failed to save score. Check backend/API connection.');
        } finally {
            setIsSaving(false);
        }
    };


    // --- Logika Render ---
    return (
        <div>
            {/* ... [Logika game UI lainnya] ... */}
            
            <button 
                // Memanggil handleSaveOnChain dengan data gameData
                onClick={() => handleSaveOnChain(
                    gameData.actionLog, 
                    gameData.blocksDestroyed, 
                    gameData.timeElapsed
                )}
                disabled={isSaving || isPending || !isConnected}
            >
                {isSaving || isPending ? <Spinner /> : "SAVE ON CHAIN (GASLESS)"}
            </button>

            {txStatus === 'success' && <p>Score berhasil diverifikasi di Base Sepolia!</p>}
            {txStatus === 'error' && <p>Gagal menyimpan skor. Cek konsol.</p>}
        </div>
    );
}