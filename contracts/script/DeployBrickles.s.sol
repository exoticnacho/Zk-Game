// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Brickles} from "../src/Brickles.sol";
import {SP1Verifier} from "../src/SP1VerifierGroth16.sol";

contract DeployBricklesScript is Script {
    function run() public returns (address gameAddress) {
        // VKey yang sudah valid dari output Rust SP1 Anda
        bytes32 PROGRAM_VERIFICATION_KEY = 0x002691c8b58b73a882725bc5a2d0cee6f8eb1ddfe25a5d0b6449c80499743683;
        
        // Ambil private key untuk broadcast (asumsi ada di .env sebagai PRIVATE_KEY)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // --- 1. Deploy Verifier (SP1VerifierGroth16.sol) ---
        vm.startBroadcast(deployerPrivateKey);
        SP1Verifier verifier = new SP1Verifier();
        address verifierAddress = address(verifier);
        vm.stopBroadcast();
        
        console.log(unicode"✅ Deployed SP1 Verifier to:", verifierAddress);

        // --- 2. Deploy Game Contract (Brickles.sol) ---
        vm.startBroadcast(deployerPrivateKey);
        Brickles game = new Brickles(verifierAddress, PROGRAM_VERIFICATION_KEY);
        vm.stopBroadcast();

        gameAddress = address(game);
        console.log(unicode"✅ Deployed Brickles Game to:", gameAddress);
        console.log("SIMPAN ALAMAT INI UNTUK FRONTEND: ", gameAddress);
    }
}