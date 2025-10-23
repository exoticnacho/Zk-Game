import { ethers } from 'hardhat';

async function main() {
  const VERIFIER_CONTRACT_ADDRESS = process.env.VERIFIER_CONTRACT_ADDRESS ?? '0x75fe7ce11E62d2be11d7ee844AF14Aa009be737B';
  const PROGRAM_VERIFICATION_KEY = process.env.PROGRAM_VERIFICATION_KEY ?? '0x002691c8b58b73a882725bc5a2d0cee6f8eb1ddfe25a5d0b6449c80499743683';

  const contractFactory = await ethers.getContractFactory('Brickles');
  const contract = await contractFactory.deploy(VERIFIER_CONTRACT_ADDRESS, PROGRAM_VERIFICATION_KEY);
  await contract.waitForDeployment();
  console.log('DEPLOYED GAME CONTRACT ADDRESS: ', await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

