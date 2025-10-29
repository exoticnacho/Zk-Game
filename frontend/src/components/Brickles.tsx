import { useAccount } from 'wagmi';
import { useWriteContracts, useCapabilities } from 'wagmi/experimental';
import { useMemo, useState, useRef, useEffect } from 'react';
import { PAYMASTER_URL, ABI, GAME_CONTRACT_ADDRESS } from '../utils/constants';
import { submitProof } from '../utils/proofs'; // Impor fungsi backend Rust Anda
import { baseSepolia } from 'wagmi/chains';
import Spinner from './Spinner'; // Asumsi Spinner adalah default export
import type { Action } from '../utils/types'; // Asumsi type Action ada
import Draggable from 'react-draggable';

interface BricklesProps {
  setShowBrickles: React.Dispatch<React.SetStateAction<boolean>>;
  zIndex: number;
  handleBricklesWindowClick: () => void;
}

// Definisikan tipe state game
interface GameState {
    actionLog: Action[]; 
    blocksDestroyed: number;
    timeElapsed: number;
}


export function Brickles({ setShowBrickles, zIndex, handleBricklesWindowClick }: BricklesProps) {
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

    const nodeRef = useRef(null);

    const gameWrapperRef = useRef<any>(null);

    const handleGameEnd = (blocksDestroyed: number, timeElapsed: number, actionLog: Action[]) => {
        setGameData({ blocksDestroyed, timeElapsed, actionLog });
        console.log("Game finished. Ready to save score.");
    };

    // Panggil initializer Wasm
    useEffect(() => {
        const CANVAS_ID = "game-canvas";

        if (typeof (window as any).init_game_wasm_engine === 'function') {
            console.log("Calling Wasm initializer...");
            
            (window as any).init_game_wasm_engine(CANVAS_ID, handleGameEnd).then((result: any) => {
                if (result && result.wrapper) {
                    gameWrapperRef.current = result.wrapper;
                    
                    // KODE INI MENJALANKAN GAME LOOP (Asumsi: Anda perlu memulai loop render/update)
                    // Anda mungkin perlu menambahkan logic requestAnimationFrame atau setInterval di sini 
                    // untuk memanggil gameWrapperRef.current.update() dan gameWrapperRef.current.render()
                    console.log("Game loop ready to start.");
                }
            });

        } else {
            console.error("Wasm Engine not ready or global function missing.");
        }

        return () => {
            // Cleanup di sini
        };
    }, []);

    // --- Logika Render ---
   return (
        <Draggable 
          bounds={{ top: -25, left: -30, right: 775, bottom: 465 }}
          nodeRef={nodeRef}
          offsetParent={document.body}
        >
          <section
            className="window"
            id="bricklesWindow"
            style={{ zIndex: zIndex }}
            onClick={handleBricklesWindowClick}
          >
            <header>
              <button
                className="close"
                onClick={() => setShowBrickles(false)}
              />
              <h2
                className="title"
                ref={nodeRef}
              >
                {' '}
                <span>Brickles</span>
              </h2>
            </header>
            <div className="content">
              <canvas 
                id="game-canvas" 
                width="640" // Tambahkan lebar
                height="480" // Tambahkan tinggi
              >
              </canvas>

              {/* Tombol Save Score */}
              <button 
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
          </section>
        </Draggable>
    );
}