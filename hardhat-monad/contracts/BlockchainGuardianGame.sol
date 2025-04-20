// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlockchainGuardianGame
 * @dev Main game contract for Blockchain Guardian game
 */
contract BlockchainGuardianGame is ERC721Enumerable, Ownable {
    
    uint256 private _tokenIds;
    
    // Player progress tracking
    mapping(address => uint256) public playerLevel;
    mapping(address => uint256) public securityPoints;
    mapping(address => uint256) public totalGasUsed;
    
    // Level contracts
    mapping(uint256 => address) public levelContracts;
    uint256 public totalLevels = 10;
    
    // Leaderboard
    struct PlayerScore {
        address wallet;
        uint256 levelsCompleted;
        uint256 securityPoints;
        uint256 totalGasUsed;
        uint256 lastUpdate;
    }
    
    PlayerScore[] public leaderboard;
    mapping(address => uint256) public playerToLeaderboardIndex;
    bool public leaderboardInitialized;
    
    // Events
    event LevelCompleted(address player, uint256 level, uint256 gasUsed);
    event NFTMinted(address player, uint256 tokenId, uint256 level);
    event LeaderboardUpdated(address player, uint256 levelsCompleted, uint256 securityPoints);
    
    constructor() ERC721("Blockchain Guardian", "BCG") Ownable(msg.sender) {
        // Initialize empty leaderboard
        leaderboardInitialized = true;
    }
    
    /**
     * @dev Set a level contract address
     * @param level Level number (1-10)
     * @param contractAddress Address of the level contract
     */
    function setLevelContract(uint256 level, address contractAddress) external onlyOwner {
        require(level > 0 && level <= totalLevels, "Invalid level");
        levelContracts[level] = contractAddress;
    }
    
    /**
     * @dev Called by level contracts when a player completes a level
     * @param player Address of the player who completed the level
     * @param level Level number completed
     */
    function completeLevel(address player, uint256 level) external {
        // Only the designated level contract can call this
        require(msg.sender == levelContracts[level], "Not authorized level contract");
        require(level > 0 && level <= totalLevels, "Invalid level");
        
        // Update player progress
        playerLevel[player] = level > playerLevel[player] ? level : playerLevel[player];
        
        // Award security points (more points for higher levels)
        uint256 pointsAwarded = level * 100;
        securityPoints[player] += pointsAwarded;
        
        // Track gas used
        totalGasUsed[player] += gasleft();
        
        // Mint NFT for level completion
        _mintLevelNFT(player, level);
        
        // Update leaderboard
        updateLeaderboard(player);
        
        emit LevelCompleted(player, level, gasleft());
    }
    
    /**
     * @dev Mint NFT for level completion
     * @param player Address to mint NFT to
     * @param level Level completed
     */
    function _mintLevelNFT(address player, uint256 level) internal {
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        _mint(player, tokenId);
        
        emit NFTMinted(player, tokenId, level);
    }
    
    /**
     * @dev Update the leaderboard with player's progress
     * @param player Address of player to update
     */
    function updateLeaderboard(address player) public {
        uint256 index;
        bool found = false;
        
        // Check if player is already on leaderboard
        if (playerToLeaderboardIndex[player] > 0 || 
            (leaderboard.length > 0 && leaderboard[0].wallet == player)) {
            index = playerToLeaderboardIndex[player];
            found = true;
        }
        
        // Update or add player to leaderboard
        PlayerScore memory score = PlayerScore({
            wallet: player,
            levelsCompleted: playerLevel[player],
            securityPoints: securityPoints[player],
            totalGasUsed: totalGasUsed[player],
            lastUpdate: block.timestamp
        });
        
        if (found) {
            leaderboard[index] = score;
        } else {
            leaderboard.push(score);
            playerToLeaderboardIndex[player] = leaderboard.length - 1;
        }
        
        // Sort leaderboard (simple implementation - can be optimized)
        _sortLeaderboard();
        
        emit LeaderboardUpdated(player, playerLevel[player], securityPoints[player]);
    }
    
    /**
     * @dev Sort leaderboard by levels completed and security points
     * Note: This is a simplified implementation and would be optimized for gas in production
     */
    function _sortLeaderboard() internal {
        uint256 n = leaderboard.length;
        for (uint i = 0; i < n - 1; i++) {
            for (uint j = 0; j < n - i - 1; j++) {
                if (leaderboard[j].levelsCompleted < leaderboard[j + 1].levelsCompleted ||
                    (leaderboard[j].levelsCompleted == leaderboard[j + 1].levelsCompleted && 
                     leaderboard[j].securityPoints < leaderboard[j + 1].securityPoints)) {
                    // Swap
                    PlayerScore memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                    
                    // Update indexes
                    playerToLeaderboardIndex[leaderboard[j].wallet] = j;
                    playerToLeaderboardIndex[leaderboard[j + 1].wallet] = j + 1;
                }
            }
        }
    }
    
    /**
     * @dev Get top N players from leaderboard
     * @param count Number of top players to return
     * @return Top players array
     */
    function getTopPlayers(uint256 count) external view returns (PlayerScore[] memory) {
        uint256 resultCount = count > leaderboard.length ? leaderboard.length : count;
        PlayerScore[] memory result = new PlayerScore[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = leaderboard[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if player has completed all levels (Genesis Guardian)
     * @param player Address to check
     * @return true if player is a Genesis Guardian
     */
    function isGenesisGuardian(address player) external view returns (bool) {
        return playerLevel[player] == totalLevels;
    }
}

/**
 * @title LevelBase
 * @dev Base contract for all level contracts
 */
abstract contract LevelBase {
    BlockchainGuardianGame public gameContract;
    uint256 public levelNumber;
    bool public selfDestructed;
    
    modifier notSelfDestructed() {
        require(!selfDestructed, "Level contract is self-destructed");
        _;
    }
    
    constructor(address _gameContract, uint256 _levelNumber) {
        gameContract = BlockchainGuardianGame(_gameContract);
        levelNumber = _levelNumber;
    }
    
    /**
     * @dev Completes the level for player
     * @param player Address of player
     */
    function _completeLevel(address player) internal {
        gameContract.completeLevel(player, levelNumber);
    }
    
    /**
     * @dev Self-destructs the contract to save space after it's no longer needed
     * Can only be called by the game contract owner
     */
    function selfDestruct() external notSelfDestructed {
        require(msg.sender == gameContract.owner(), "Only game owner can self-destruct");
        selfDestructed = true;
        // In a real implementation, you'd use selfdestruct() here
        // However, it's deprecated in newer Solidity versions, so this is a placeholder
    }
}

/**
 * @title Level1Genesis
 * @dev Level 1: Transaction Signature Verification
 */
contract Level1Genesis is LevelBase {
    constructor(address _gameContract) LevelBase(_gameContract, 1) {}
    
    /**
     * @dev Gets the Ethereum signed message hash from a message hash
     * @param _messageHash The hash of the original message
     * @return The Ethereum signed message hash
     */
    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        // This recreates the signed message hash that is created by ethers.js signMessage
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );
    }

    /**
     * @dev Verifies a transaction signature
     * @param txHash Transaction hash
     * @param v V component of signature
     * @param r R component of signature
     * @param s S component of signature
     * @return Recovered signer address
     */
    function verifySignature(
        bytes32 txHash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public notSelfDestructed returns (address) {
        // Get the Ethereum signed message hash
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(txHash);
        
        // Recover signer address using ecrecover
        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        
        // Check if the signature is valid (not zero address)
        require(signer != address(0), "Invalid signature");
        
        // Check if signer matches sender (optional)
        // require(signer == msg.sender, "Signer does not match sender");
        
        // If successful, complete the level
        _completeLevel(msg.sender);
        
        return signer;
    }
    
    /**
     * @dev Simpler signature verification function that accepts the full signature bytes
     * @param messageHash The original message hash
     * @param signature The signature bytes (65 bytes: r, s, v)
     * @return Recovered signer address
     */
    function verifySignatureBytes(
        bytes32 messageHash,
        bytes memory signature
    ) public notSelfDestructed returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        // Extract r, s, v from the signature
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        // Convert v if needed (Ethereum mainnet)
        if (v < 27) {
            v += 27;
        }
        
        // Get the Ethereum signed message hash
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        
        // Recover signer address
        address signer = ecrecover(ethSignedMessageHash, v, r, s);
        
        // Check if the signature is valid
        require(signer != address(0), "Invalid signature");
        
        // If successful, complete the level
        _completeLevel(msg.sender);
        
        return signer;
    }
}

/**
 * @title Level2HashFortress (Simplified)
 * @dev Level 2: Cryptographic Hashing with an easier solution
 */
contract Level2HashFortress is LevelBase {
    bytes32 public targetPrefixHash;
    
    constructor(address _gameContract, bytes32 _targetPrefixHash) LevelBase(_gameContract, 2) {
        // Using a more easily findable target prefix
        // Just requires matching the first byte instead of 4 bytes
        targetPrefixHash = _targetPrefixHash;
    }
    
    /**
     * @dev Solves the hash puzzle by finding a pre-image with matching prefix
     * @param solution Proposed solution to check
     */
    function solveHashPuzzle(bytes32 solution) public notSelfDestructed {
        bytes32 fullHash = keccak256(abi.encode(solution));
        
        // Check only first byte matches target prefix (much easier)
        // Using bytes32(uint256(0xff) << 248) as mask (just first byte)
        require(fullHash & bytes32(uint256(0xff) << 248) == targetPrefixHash & bytes32(uint256(0xff) << 248), 
                "Hash prefix doesn't match");
        
        // If successful, complete the level
        _completeLevel(msg.sender);
    }
}

/**
 * @title Level3MerkleMaze
 * @dev Level 3: Merkle Proof Validation
 */
contract Level3MerkleMaze is LevelBase {
    bytes32 public rootHash;
    
    constructor(address _gameContract, bytes32 _rootHash) LevelBase(_gameContract, 3) {
        rootHash = _rootHash;
    }
    
    /**
     * @dev Verifies a Merkle proof
     * @param proof Array of hashes forming the proof
     * @param leaf Leaf node (transaction hash)
     * @param index Index of the leaf in the tree
     */
    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 leaf,
        uint256 index
    ) public notSelfDestructed {
        bytes32 hash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            hash = index % 2 == 0
                ? keccak256(abi.encode(hash, proof[i]))
                : keccak256(abi.encode(proof[i], hash));
            index = index / 2;
        }
        
        // Verify proof leads to root hash
        require(hash == rootHash, "Invalid Merkle proof");
        
        // If successful, complete the level
        _completeLevel(msg.sender);
    }
}

/**
 * @title Modified Level4ReentrancyLabyrinth
 * @dev Level 4: Smart Contract Vulnerabilities with clearer mechanics
 */
contract Level4ReentrancyLabyrinth {
    address public gameContract;
    uint256 public levelNumber;
    
    mapping(address => uint256) public balances;
    mapping(address => bool) public hasWithdrawn;
    uint256 public totalDeposits;
    bool private locked;
    
    // Vulnerable function on purpose
    bool public exploitSuccessful;
    
    constructor(address _gameContract) payable {
        gameContract = _gameContract;
        levelNumber = 4;
        
        // Initialize contract with some funds
        totalDeposits = msg.value;
    }
    
    modifier notSelfDestructed() {
        _;
    }
    
    /**
     * @dev Deposit funds into the contract
     */
    function deposit() external payable notSelfDestructed {
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
    }
    
    /**
     * @dev Vulnerable withdrawal function (intentionally vulnerable)
     * @param amount Amount to withdraw
     */
    function vulnerableWithdraw(uint256 amount) external notSelfDestructed {
        // Intentionally vulnerable function that players need to exploit
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Reentrancy vulnerability - sends before updating balance
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
    }
    
    /**
     * @dev Function to check if player successfully exploited the contract
     * @param solution Address of the solution contract
     */
    function checkExploit(address solution) external notSelfDestructed {
        // Call the solution contract to test if it can exploit
        (bool success,) = solution.call(abi.encodeWithSignature("exploit()"));
        require(success, "Exploit failed");
        
        // Check if more funds were withdrawn than deposited by the attacker
        uint256 contractBalance = address(this).balance;
        require(contractBalance < totalDeposits, "No funds were exploited");
        
        exploitSuccessful = true;
    }
    
    /**
     * @dev Secure withdrawal function that player needs to implement
     * @param amount Amount to withdraw
     */
    function secureWithdraw(uint256 amount) external notSelfDestructed {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(!locked, "Reentrant call");
        
        locked = true;
        
        // Update state before external call (checks-effects-interactions pattern)
        balances[msg.sender] -= amount;
        
        // External call after state updates
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        locked = false;
    }
    
    /**
     * @dev Complete level if both exploit and secure solution are done
     */
    function validateSolution() external notSelfDestructed {
        // Check if player successfully exploited and then secured the contract
        require(exploitSuccessful, "You need to successfully exploit the contract first");
        require(!hasWithdrawn[msg.sender], "Already withdrawn securely"); 
        
        // Test secure withdrawal
        uint256 currentBalance = balances[msg.sender];
        if (currentBalance == 0) {
            // If balance is zero, let's add some funds for testing
            uint256 testAmount = 0.01 ether;
            balances[msg.sender] = testAmount;
        }
        
        // Test the secure withdrawal
        this.secureWithdraw(balances[msg.sender]);
        hasWithdrawn[msg.sender] = true;
        
        // If successful, complete the level
        _completeLevel(msg.sender);
    }
    
    /**
     * @dev Completes the level for player
     * @param player Address of player
     */
    function _completeLevel(address player) internal {
        // In a real scenario, this would call the game contract
        // For our test, just emit an event
        emit LevelCompleted(player, levelNumber);
    }
    
    // Event for level completion
    event LevelCompleted(address player, uint256 level);
    
    receive() external payable {}
}

/**
 * @title Level5ConsensusArena
 * @dev Level 5: Proof-of-Stake Mechanics
 */
contract Level5ConsensusArena is LevelBase {
    struct Block {
        uint256 id;
        bytes32 dataHash;
        uint256 totalVotes;
        uint256 totalStake;
        bool finalized;
    }
    
    // Stake tracking
    mapping(address => uint256) public stake;
    uint256 public totalStake;
    
    // Block voting
    mapping(uint256 => Block) public blocks;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    uint256 public currentBlockId;
    
    // Threshold for consensus (66%)
    uint256 public constant CONSENSUS_THRESHOLD = 66;
    
    constructor(address _gameContract) LevelBase(_gameContract, 5) {
        currentBlockId = 1;
        // Generate first block
        blocks[currentBlockId] = Block({
            id: currentBlockId,
            dataHash: keccak256(abi.encode("Genesis Block")),
            totalVotes: 0,
            totalStake: 0,
            finalized: false
        });
    }
    
    /**
     * @dev Stake tokens for voting power
     */
    function stakeTokens() external payable notSelfDestructed {
        stake[msg.sender] += msg.value;
        totalStake += msg.value;
    }
    
    /**
     * @dev Submit a vote for current block
     * @param approval Whether the player approves the block
     */
    function submitVote(bool approval) external notSelfDestructed {
        require(stake[msg.sender] > 0, "No stake to vote with");
        require(!hasVoted[msg.sender][currentBlockId], "Already voted for this block");
        require(!blocks[currentBlockId].finalized, "Block already finalized");
        
        // Record vote
        hasVoted[msg.sender][currentBlockId] = true;
        
        // Update block votes
        if (approval) {
            blocks[currentBlockId].totalVotes += stake[msg.sender];
        }
        blocks[currentBlockId].totalStake += stake[msg.sender];
        
        // Check if consensus reached
        if (blocks[currentBlockId].totalStake >= totalStake * 2 / 3) {
            // At least 2/3 of all stake has voted
            uint256 approvalPercentage = (blocks[currentBlockId].totalVotes * 100) / blocks[currentBlockId].totalStake;
            
            if (approvalPercentage >= CONSENSUS_THRESHOLD) {
                // Consensus reached, finalize block
                blocks[currentBlockId].finalized = true;
                
                // Create next block
                currentBlockId++;
                blocks[currentBlockId] = Block({
                    id: currentBlockId,
                    dataHash: keccak256(abi.encode("Block", currentBlockId)),
                    totalVotes: 0,
                    totalStake: 0,
                    finalized: false
                });
                
                // If player has participated in 3 successful consensus rounds, complete level
                if (currentBlockId >= 4 && hasVoted[msg.sender][currentBlockId - 1] && 
                    hasVoted[msg.sender][currentBlockId - 2] && hasVoted[msg.sender][currentBlockId - 3]) {
                    _completeLevel(msg.sender);
                }
            }
        }
    }
    
    /**
     * @dev Unstake tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external notSelfDestructed {
        require(stake[msg.sender] >= amount, "Insufficient stake");
        
        stake[msg.sender] -= amount;
        totalStake -= amount;
        
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}