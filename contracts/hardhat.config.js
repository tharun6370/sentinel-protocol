require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// We need your Private Key to deploy to a live network.
// WARNING: Use a test wallet with no real money!
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      mining: {
        auto: true,
        interval: 0
      }
    },
    // 👇 ADDING SHARDEUM SPHINX CONFIGURATION
    shardeum: {
      url: "https://api-mezame.shardeum.org/", // New Active Testnet RPC
      chainId: 8119,                           // New Chain ID
      accounts: [PRIVATE_KEY],
      gas: 20000000,
    },

    // ... inside networks object ...
    inco: {
      url: "https://validator.rivest.inco.org", // Updated RPC
      chainId: 21097,                             // Updated Chain ID (Rivest)
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    }
  }
};