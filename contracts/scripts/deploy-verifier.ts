import { ethers } from 'hardhat';

async function main() {
  const contractFactory = await ethers.getContractFactory('SP1Verifier');
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  console.log('DEPLOYED VERIFIER CONTRACT ADDRESS: ', await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

