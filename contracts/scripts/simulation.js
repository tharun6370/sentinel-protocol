const hre = require("hardhat");

async function main() {
  console.log("--- 🛡️ SENTINEL PROTOCOL: RESCUE SIMULATION 🛡️ ---\n");

  // 1. SETUP ACCOUNTS
  const [deployer, victim, hacker, coldVault] = await hre.ethers.getSigners();
  
  // 2. DEPLOY TOKEN & FUND VICTIM
  // The victim has 1000 Tokens that the hacker wants to steal.
  const Token = await hre.ethers.getContractFactory("MockToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  // Transfer 1000 tokens to the Victim
  const amount = hre.ethers.parseEther("1000");
  await token.transfer(victim.address, amount);

  console.log(`✅ Setup Complete: Victim Wallet (${victim.address.slice(0,6)}...) holds 1000 VULN`);
  
  // 3. STOP AUTOMINING (Simulate Mempool)
  // This pauses the chain so transactions sit in "pending" status
  await hre.network.provider.send("evm_setAutomine", [false]);
  await hre.network.provider.send("evm_setIntervalMining", [0]);
  console.log("⏸️  Blockchain Paused. Transactions will sit in mempool.\n");

  // 4. HACKER INITIATES ATTACK (Standard Gas)
  // Hacker tries to move funds to their own address
  console.log("⚠️  HACKER DETECTED! Initiating drain transaction...");
  
  const hackerTxPromise = token.connect(victim).transfer(hacker.address, amount, {
    gasPrice: hre.ethers.parseUnits("10", "gwei"), // Low/Standard Gas
    nonce: await victim.getNonce() // Same nonce as rescue (Race Condition)
  });

  // 5. SENTINEL AGENT INITIATES RESCUE (High Gas)
  // We see the hack and broadcast a transaction with SAME nonce but HIGHER gas
  console.log("🚨 SENTINEL ACTIVATED! Broadcasting rescue transaction (Gas War)...");
  
  const rescueTxPromise = token.connect(victim).transfer(coldVault.address, amount, {
    gasPrice: hre.ethers.parseUnits("100", "gwei"), // 10x Gas Price (The "Bribe")
    nonce: await victim.getNonce() // Re-using nonce to overwrite hacker tx
  });

  // 6. MINE THE BLOCK
  // We manually mine the block. The miner will pick the transaction with higher gas.
  console.log("⛏️  Mining block...");
  await hre.network.provider.send("evm_mine");
  
  // Re-enable automining for cleanup
  await hre.network.provider.send("evm_setAutomine", [true]);

  // 7. CHECK RESULTS
  // We wait for the transactions to settle. One will fail (nonce collision) or be dropped.
  try {
    await rescueTxPromise;
    console.log("\n✅ RESCUE SUCCESSFUL: Transaction confirmed.");
  } catch (e) {
    console.log("❌ RESCUE FAILED.");
  }

  try {
    await hackerTxPromise;
    console.log("❌ HACKER SUCCESSFUL: Transaction confirmed.");
  } catch (e) {
    console.log("\n✅ HACKER FAILED: Transaction dropped/replaced.");
  }

  // Final Balances
  const hackerBalance = await token.balanceOf(hacker.address);
  const vaultBalance = await token.balanceOf(coldVault.address);

  console.log("\n--- FINAL RESULTS ---");
  console.log(`😈 Hacker Balance:     ${hre.ethers.formatEther(hackerBalance)} VULN`);
  console.log(`🏦 Cold Vault Balance: ${hre.ethers.formatEther(vaultBalance)} VULN`);

  if (vaultBalance === amount) {
    console.log("\n🏆 CONCLUSION: Sentinel Protocol successfully front-ran the attacker.");
  } else {
    console.log("\n💀 CONCLUSION: Protocol failed.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});