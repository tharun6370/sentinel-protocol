const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 1. Get the deployer account (Only 1 exists on Testnet)
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);

  // 2. Define a Cold Vault Address
  // Since we don't have a second account loaded, we'll use a hardcoded address or the deployer.
  // Ideally, this is a hardware wallet. For this test, we can use the deployer or a dummy.
  const coldVaultAddress = deployer.address; 
  console.log("Cold Vault address set to:", coldVaultAddress);

  // 3. Deploy the PanicVault
  const PanicVault = await hre.ethers.getContractFactory("PanicVault");
  const panicVault = await PanicVault.deploy(coldVaultAddress);

  await panicVault.waitForDeployment();
  
  const address = await panicVault.getAddress();
  console.log("🚨 PanicVault deployed to:", address);

  // 4. Save the Frontend Files
  saveFrontendFiles(address, "PanicVault");
}

function saveFrontendFiles(contractAddress, name) {
  const fs = require("fs");
  const path = require("path");

  // We save directly into the Dashboard folder
  const contractsDir = path.join(__dirname, "..", "..", "dashboard", "app", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save Address
  fs.writeFileSync(
    path.join(contractsDir, `${name}-address.json`),
    JSON.stringify({ address: contractAddress }, undefined, 2)
  );

  // Save ABI
  const ContractArtifact = artifacts.readArtifactSync(name);
  fs.writeFileSync(
    path.join(contractsDir, `${name}.json`),
    JSON.stringify(ContractArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});