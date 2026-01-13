// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StealthVault {
    // Event to prove data was stored (but it will look like gibberish)
    event EncryptedIntentStored(address indexed user, bytes encryptedData, uint256 timestamp);

    // This function accepts raw bytes (simulating an encrypted payload)
    function storeEncryptedIntent(bytes calldata encryptedData) external {
        emit EncryptedIntentStored(msg.sender, encryptedData, block.timestamp);
    }
}