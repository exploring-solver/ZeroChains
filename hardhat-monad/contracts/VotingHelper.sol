// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for Level5ConsensusArena
interface ILevel5ConsensusArena {
    function stakeTokens() external payable;
    function submitVote(bool approval) external;
    function unstake(uint256 amount) external;
    function stake(address staker) external view returns (uint256);
    function currentBlockId() external view returns (uint256);
    function hasVoted(address voter, uint256 blockId) external view returns (bool);
}

/**
 * @title VotingHelper
 * @dev Helper contract to stake and vote in the Level5ConsensusArena
 */
contract VotingHelper {
    address public owner;
    address public level5Contract;
    
    constructor(address _level5Contract) {
        owner = msg.sender;
        level5Contract = _level5Contract;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Stake tokens and optionally vote
     * @param vote Whether to vote for the current block
     */
    function stakeAndVote(bool vote) external payable onlyOwner {
        // Stake tokens
        require(msg.value > 0, "Must send ETH to stake");
        
        ILevel5ConsensusArena(level5Contract).stakeTokens{value: msg.value}();
        
        // Vote if requested
        if (vote) {
            submitVote(vote);
        }
    }
    
    /**
     * @dev Submit a vote for the current block
     * @param approval Whether to approve the block
     */
    function submitVote(bool approval) public onlyOwner {
        ILevel5ConsensusArena(level5Contract).submitVote(approval);
    }
    
    /**
     * @dev Unstake tokens and send back to owner
     */
    function unstakeAll() external onlyOwner {
        uint256 stakedAmount = ILevel5ConsensusArena(level5Contract).stake(address(this));
        if (stakedAmount > 0) {
            ILevel5ConsensusArena(level5Contract).unstake(stakedAmount);
            
            // Transfer ETH back to owner
            (bool success, ) = owner.call{value: address(this).balance}("");
            require(success, "Transfer failed");
        }
    }
    
    /**
     * @dev Withdraw any ETH in this contract
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}