const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🕵️ Deploying Stealth Protocol with:", deployer.address);

  const StealthVault = await hre.ethers.getContractFactory("StealthVault");
  const vault = await StealthVault.deploy();
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("🟣 StealthVault deployed to:", address);

  // Save details for the Dashboard
  saveFrontendFiles(address, "StealthVault");
}

function saveFrontendFiles(contractAddress, name) {
  const contractsDir = path.join(__dirname, "..", "..", "dashboard", "app", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, `${name}-address.json`),
    JSON.stringify({ address: contractAddress }, undefined, 2)
  );

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