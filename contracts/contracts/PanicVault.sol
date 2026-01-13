// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PanicVault is Ownable {
    // The safe address (Cold Vault)
    address public coldVault;
    
    // Events for the Dashboard
    event PanicTriggered(address indexed user, uint256 timestamp);
    event AssetsRescued(address indexed token, uint256 amount);

    constructor(address _coldVault) Ownable(msg.sender) {
        coldVault = _coldVault;
    }

    /**
     * @dev The Panic Button. 
     * This function must be called with a HIGH GAS PRICE to win the block against hackers.
     */
    function triggerLockdown(address[] calldata tokens) external onlyOwner {
        emit PanicTriggered(msg.sender, block.timestamp);

        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20 token = IERC20(tokens[i]);
            uint256 balance = token.balanceOf(address(this));
            
            if (balance > 0) {
                // Move funds immediately to cold storage
                bool success = token.transfer(coldVault, balance);
                require(success, "Rescue failed");
                emit AssetsRescued(tokens[i], balance);
            }
        }
    }
    
    // Allow contract to receive ETH/SHM
    receive() external payable {}
    
    function rescueNative() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = coldVault.call{value: balance}("");
        require(sent, "Native rescue failed");
    }
}