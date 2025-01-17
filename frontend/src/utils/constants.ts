import type { Address } from 'viem';
import * as CONTRACT_ABI from '../../../contracts/artifacts-zk/contracts/Brickles.sol/Brickles.json';

export const ABI = CONTRACT_ABI.abi;
export const GAME_CONTRACT_ADDRESS: Address = '0x...';
export const PAYMASTER_CONTRACT_ADDRESS: Address = '0x...';
export const API_URL = 'http://localhost:8000';
