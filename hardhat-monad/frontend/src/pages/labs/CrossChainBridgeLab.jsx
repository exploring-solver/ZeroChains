// src/components/labs/CrossChainBridgeLab.jsx
import React, { useState, useEffect } from 'react';
import './CrossChainBridgeLab.css'; // Create this CSS file for styling

// --- Mock Data ---
const mockAmoyChainId = 421613; // Arbitrum Goerli (Amoy replacement in this context)
const mockSepoliaChainId = 11155111; // Sepolia

// --- Code Snippets ---
const tokenCode = `// Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Token is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor(
        string memory name, 
        string memory symbol, 
        uint256 initialSupply, 
        address admin
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        // Mint initial supply to the deployer/admin for simplicity in example
        _mint(admin, initialSupply * (10 ** decimals())); 
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(BURNER_ROLE) whenNotPaused {
        // Note: In a real burn scenario for bridging, burning might happen from the bridge contract's address
        // after receiving tokens via transferFrom. This simplified version assumes a burner role can burn from any account.
        // A more typical pattern: Burner role calls a function that calls _burn(from, amount) after checks.
        require(allowance(from, msg.sender) >= amount, "ERC20: burn amount exceeds allowance");
        _burn(from, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Override transfer functions to add pause check
    function transfer(address to, uint256 amount) 
        public 
        override 
        whenNotPaused 
        returns (bool) 
    {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }
}`;

const relayerManagerCode = `// RelayerManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract RelayerManager is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE"); // For potential future use
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Simplified: In reality, you might store more request details or just the hash
    mapping(bytes32 => bool) public executedRequests; // Keep track of executed requests to prevent replay
    bytes32 public relayerMerkleRoot;
    
    event RelayerRootUpdated(
        bytes32 oldRoot,
        bytes32 newRoot,
        address updater
    );

    // Event to signal a request ID has been marked as executed (often by the destination bridge)
    event RequestExecuted(bytes32 indexed requestId);

    constructor(bytes32 _initialRelayerMerkleRoot, address admin) {
        relayerMerkleRoot = _initialRelayerMerkleRoot;
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function updateRelayerRoot(bytes32 _newRoot) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenNotPaused 
    {
        bytes32 oldRoot = relayerMerkleRoot;
        relayerMerkleRoot = _newRoot;
        emit RelayerRootUpdated(oldRoot, _newRoot, msg.sender);
    }

    /**
     * @dev Generates a unique ID for a transfer request.
     * This function is pure and can be called off-chain or by other contracts.
     * Nonce here could be a timestamp, a sequential number from the source bridge, etc.
     */
    function generateRequestId(
        address user,
        address recipient,
        uint256 amount,
        uint256 nonce, // Unique element per request (e.g., source tx timestamp or nonce)
        uint256 sourceChainId,
        uint256 targetChainId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            user,
            recipient,
            amount,
            nonce,
            sourceChainId,
            targetChainId
        ));
    }

    /**
     * @dev Verifies if an address is a valid relayer using a Merkle proof.
     * Called by the destination bridge contract to authorize the relayer.
     */
    function verifyRelayer(address relayer, bytes32[] calldata proof) 
        public view returns (bool) 
    {
        bytes32 leaf = keccak256(abi.encodePacked(relayer));
        return MerkleProof.verify(proof, relayerMerkleRoot, leaf);
    }

    /**
     * @dev Marks a request ID as executed. Typically called by an admin or manager role
     * ONLY in emergency situations if the automated flow fails. 
     * The primary execution marking should happen within the bridge unlock/release functions.
     */
    function emergencyMarkExecuted(bytes32 requestId)
        external
        onlyRole(ADMIN_ROLE) // Or a dedicated recovery role
    {
        require(!executedRequests[requestId], "Request already executed");
        executedRequests[requestId] = true;
        emit RequestExecuted(requestId);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}`;

const bridgeAmoyCode = `// BridgeAmoyV2.sol (Source Chain)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Assume Token.sol provides these functions, use interface for interaction
interface IAmoyToken is IERC20 {
    // No mint/burn needed on source chain if it's the canonical token
}

interface IRelayerManager {
    function verifyRelayer(address relayer, bytes32[] calldata proof) external view returns (bool);
    function generateRequestId(
        address user,
        address recipient,
        uint256 amount,
        uint256 nonce,
        uint256 sourceChainId,
        uint256 targetChainId
    ) external pure returns (bytes32);
    // Relayer Manager doesn't need executedRequests mapping, Bridge contracts handle processing status
}

contract BridgeAmoyV2 is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // OPERATOR_ROLE might be used for less critical functions than ADMIN
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE"); 
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    IAmoyToken public token; // The original token on Amoy
    IRelayerManager public relayerManager; // Contract to verify relayers and generate IDs
    mapping(bytes32 => bool) public processedRequests; // Tracks requests processed *on this bridge* (e.g., unlocked funds)
    uint256 public maxTransferAmount;
    uint256 public minTransferAmount;
    uint256 public bridgeNonce; // Nonce specific to this bridge for request ID generation

    uint256 public constant TARGET_CHAIN_ID = 11155111; // Sepolia

    event LockRequested(
        bytes32 indexed requestId,
        address indexed user,        // The original sender on Amoy
        address indexed recipient,   // The final recipient on Sepolia
        uint256 amount,
        uint256 nonce,           // Bridge nonce used for this request
        uint256 sourceChainId,
        uint256 targetChainId
    );

    // Event for when tokens are unlocked (released back to user on Amoy in case of burn-unlock model)
    // This contract uses lock-release, so unlock happens on Sepolia. We track processing here.
    event TransferProcessed( // Renamed for clarity: signifies processing on the *target* chain
        bytes32 indexed requestId,
        address indexed executor, // Relayer address on Sepolia
        bool success             // Whether the unlock/release succeeded on Sepolia
    );

    event BridgeLimitsUpdated(
        uint256 newMinAmount,
        uint256 newMaxAmount
    );

    constructor(
        address _token, 
        address _relayerManager,
        address admin,
        uint256 _minTransferAmount,
        uint256 _maxTransferAmount
    ) {
        require(_token != address(0) && _relayerManager != address(0) && admin != address(0), "Invalid addresses");
        token = IAmoyToken(_token);
        relayerManager = IRelayerManager(_relayerManager);
        minTransferAmount = _minTransferAmount;
        maxTransferAmount = _maxTransferAmount;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin); // Grant operator role too
        _grantRole(PAUSER_ROLE, admin);
    }

    /**
     * @dev Locks tokens on the source chain (Amoy) to initiate a bridge transfer.
     * User calls this function.
     * Emits a LockRequested event that relayers listen for.
     */
    function lockWithRelay(
        uint256 amount,
        address recipient // Recipient address on the TARGET chain (Sepolia)
    ) external nonReentrant whenNotPaused {
        require(amount >= minTransferAmount, "Amount below minimum");
        require(amount <= maxTransferAmount, "Amount above maximum");
        require(recipient != address(0), "Invalid recipient");
        
        // Pull tokens from the user to this bridge contract
        require(token.transferFrom(msg.sender, address(this), amount), "ERC20: transferFrom failed");
        
        uint256 currentNonce = bridgeNonce;
        bridgeNonce++; // Increment nonce for next request

        bytes32 requestId = relayerManager.generateRequestId(
            msg.sender,      // User initiating the lock
            recipient,       // Final recipient on target chain
            amount,
            currentNonce,    // Use bridge's internal nonce
            block.chainid,   // Source chain ID (Amoy)
            TARGET_CHAIN_ID  // Target chain ID (Sepolia)
        );
            
        // Emit event for relayers
        emit LockRequested(
            requestId, 
            msg.sender, 
            recipient, 
            amount, 
            currentNonce, 
            block.chainid, 
            TARGET_CHAIN_ID
        );
    }

    /**
     * @dev Unlocks tokens back to the original sender on the source chain (Amoy).
     * This function would be used if the bridge model was burn-and-unlock.
     * A relayer, after seeing a 'Burn' event on Sepolia, would call this.
     * Requires proof that the relayer is valid.
     */
    function unlock(
        bytes32 requestId,       // The unique ID from the burn event on Sepolia
        address originalSender,  // Who initiated the burn on Sepolia (should match original locker)
        address recipientOnSource, // Who should receive the unlocked tokens (usually originalSender)
        uint256 amount,
        uint256 sourceNonce,    // Nonce from the source chain's burn event
        uint256 sourceChainId, // Should be Sepolia's chain ID
        uint256 targetChainId, // Should be Amoy's chain ID
        bytes32[] calldata relayerProof // Merkle proof for the relayer
    ) external nonReentrant whenNotPaused {
        // 1. Verify Relayer
        require(relayerManager.verifyRelayer(msg.sender, relayerProof), "Invalid relayer");

        // 2. Verify Request ID matches parameters (important anti-tampering check)
         bytes32 reconstructedRequestId = relayerManager.generateRequestId(
            originalSender,     // User who initiated the action on the *other* chain (burn)
            recipientOnSource,  // Final recipient on *this* chain
            amount,
            sourceNonce,        // Nonce from the *other* chain's event
            sourceChainId,      // The *other* chain's ID
            targetChainId       // *This* chain's ID
        );
        require(reconstructedRequestId == requestId, "Request ID mismatch");

        // 3. Check if already processed
        require(!processedRequests[requestId], "Request already processed");

        // 4. Validate parameters
        require(recipientOnSource != address(0), "Invalid recipient");
        // Amount checks might not be needed if request ID verification is robust, but doesn't hurt
        require(amount >= minTransferAmount, "Amount below minimum"); 
        require(amount <= maxTransferAmount, "Amount above maximum");
        
        // 5. Mark as processed
        processedRequests[requestId] = true;
        
        // 6. Perform the unlock (transfer tokens back from bridge)
        bool success = token.transfer(recipientOnSource, amount);
        emit TransferProcessed(requestId, msg.sender, success); // Log execution attempt
        
        // 7. Require success
        require(success, "ERC20: transfer failed");
    }


    // --- Admin Functions ---

    function updateTransferLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyRole(ADMIN_ROLE) {
        require(_minAmount <= _maxAmount, "Invalid limits");
        minTransferAmount = _minAmount;
        maxTransferAmount = _maxAmount;
        emit BridgeLimitsUpdated(_minAmount, _maxAmount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // Allows admin to withdraw *any* ERC20 token accidentally sent to the bridge
    function emergencyWithdraw(
        address tokenAddress, // Address of the token to withdraw
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Invalid recipient");
        require(tokenAddress != address(0), "Invalid token address");
        
        IERC20 recoveryToken = IERC20(tokenAddress);
        uint256 balance = recoveryToken.balanceOf(address(this));
        require(amount <= balance, "Insufficient balance for withdrawal");

        require(recoveryToken.transfer(to, amount), "Emergency withdrawal failed");
    }

    // Allows admin to withdraw the *bridged* token in an emergency
     function emergencyWithdrawBridgedToken(
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
         require(to != address(0), "Invalid recipient");
         uint256 balance = token.balanceOf(address(this));
         require(amount <= balance, "Insufficient balance for withdrawal");
         require(token.transfer(to, amount), "Emergency withdrawal failed");
    }

    // Fallback to receive ETH? Generally bridges shouldn't hold ETH unless designed for it.
    // receive() external payable {} 
}`;

const bridgeSepoliaCode = `// BridgeSepoliaV2.sol (Destination Chain)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface for the wrapped token on Sepolia - needs mint/burn capabilities
interface ISepoliaToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external; // Bridge will likely burn from its own balance
    // Add owner() or access control check if mint/burn are restricted
    function owner() external view returns (address); // Example if Ownable
    function hasRole(bytes32 role, address account) external view returns (bool); // Example if AccessControl
}

interface IRelayerManager {
    function verifyRelayer(address relayer, bytes32[] calldata proof) external view returns (bool);
    function generateRequestId(
        address user,
        address recipient,
        uint256 amount,
        uint256 nonce,
        uint256 sourceChainId,
        uint256 targetChainId
    ) external pure returns (bytes32);
}

contract BridgeSepoliaV2 is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_BURNER_ROLE = keccak256("MINTER_BURNER_ROLE"); // Role needed for wrapped token

    ISepoliaToken public wrappedToken; // The wrapped token on Sepolia
    IRelayerManager public relayerManager;
    mapping(bytes32 => bool) public processedRequests; // Tracks requests processed *on this bridge* (e.g., released/minted tokens)
    uint256 public maxTransferAmount;
    uint256 public minTransferAmount;
    uint256 public bridgeNonce; // Nonce specific to this bridge for request ID generation (for burn-release)

    uint256 public constant SOURCE_CHAIN_ID = 421613; // Amoy

    // Event when wrapped tokens are released (minted) on Sepolia
    event ReleaseCompleted( // Renamed from ReleaseRequested for clarity
        bytes32 indexed requestId,
        address indexed recipient, // Final recipient on Sepolia
        uint256 amount,
        address indexed executor   // Relayer who executed the release
    );

    // Event when wrapped tokens are burned on Sepolia to initiate transfer back to Amoy
     event BurnInitiated( // Renamed from ReleaseRequested for clarity
        bytes32 indexed requestId,
        address indexed user,        // User burning tokens on Sepolia
        address indexed recipient,   // Recipient on Amoy
        uint256 amount,
        uint256 nonce,           // Bridge nonce used for this request
        uint256 sourceChainId,   // Sepolia
        uint256 targetChainId    // Amoy
    );


    event TransferProcessed( // Log execution attempts (e.g., minting)
        bytes32 indexed requestId,
        address indexed executor,
        bool success
    );

    event BridgeLimitsUpdated(
        uint256 newMinAmount,
        uint256 newMaxAmount
    );

    constructor(
        address _wrappedToken, // Address of the deployed wrapped token contract
        address _relayerManager,
        address admin,
        uint256 _minTransferAmount,
        uint256 _maxTransferAmount
    ) {
        require(_wrappedToken != address(0) && _relayerManager != address(0) && admin != address(0), "Invalid addresses");
        wrappedToken = ISepoliaToken(_wrappedToken);
        relayerManager = IRelayerManager(_relayerManager);
        minTransferAmount = _minTransferAmount;
        maxTransferAmount = _maxTransferAmount;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        // IMPORTANT: The Bridge contract needs the MINTER_ROLE and BURNER_ROLE on the wrapped token contract
        // This must be granted separately after deployment (e.g., by the token's admin)
        // We grant a conceptual role here for clarity in the bridge's own access control if needed internaly
        _grantRole(MINTER_BURNER_ROLE, address(this)); // Grant role to itself? Might not be needed depending on token setup
    }

    /**
     * @dev Releases (mints) wrapped tokens on the destination chain (Sepolia).
     * Called by a verified relayer after observing a LockRequested event on Amoy.
     */
    function release(
        bytes32 requestId,       // The unique ID from the lock event on Amoy
        address originalSender,  // Who initiated the lock on Amoy
        address recipient,       // Who should receive the wrapped tokens on Sepolia
        uint256 amount,
        uint256 sourceNonce,    // Nonce from the source chain's lock event
        uint256 sourceChainId, // Should be Amoy's chain ID
        uint256 targetChainId, // Should be Sepolia's chain ID
        bytes32[] calldata relayerProof // Merkle proof for the relayer
    ) external nonReentrant whenNotPaused {
        // 1. Verify Relayer
        require(relayerManager.verifyRelayer(msg.sender, relayerProof), "Invalid relayer");

        // 2. Verify Request ID matches parameters
         bytes32 reconstructedRequestId = relayerManager.generateRequestId(
            originalSender,    // User who initiated the action on the *other* chain (lock)
            recipient,         // Final recipient on *this* chain
            amount,
            sourceNonce,       // Nonce from the *other* chain's event
            sourceChainId,     // The *other* chain's ID
            targetChainId      // *This* chain's ID
        );
        require(reconstructedRequestId == requestId, "Request ID mismatch");

        // 3. Check if already processed
        require(!processedRequests[requestId], "Request already processed");

        // 4. Validate parameters
        require(recipient != address(0), "Invalid recipient");
        require(amount >= minTransferAmount, "Amount below minimum");
        require(amount <= maxTransferAmount, "Amount above maximum");

        // 5. Mark as processed
        processedRequests[requestId] = true;

        // 6. Perform the release (mint wrapped tokens)
        // Ensure this bridge contract has Minter role on the wrappedToken contract!
        try wrappedToken.mint(recipient, amount) {
             emit ReleaseCompleted(requestId, recipient, amount, msg.sender);
             emit TransferProcessed(requestId, msg.sender, true); // Log success
        } catch {
             // If mint fails, revert and log failure. 
             // Note: Reverting here means the request isn't marked processed, allowing retry.
             // Consider if processedRequests should be marked even on failure depending on desired retry logic.
             emit TransferProcessed(requestId, msg.sender, false); // Log failure
             revert("Minting failed"); 
             // If you don't revert, the request is marked processed even if mint failed. Needs careful consideration.
             // processedRequests[requestId] = true; // Mark processed even on failure? Risky.
        }
    }

    /**
     * @dev Burns wrapped tokens on Sepolia to initiate a transfer back to Amoy.
     * User calls this function with the address they want tokens sent to on Amoy.
     */
    function burnWithRelay(
        uint256 amount,
        address recipientOnSource // Recipient address on the SOURCE chain (Amoy)
    ) external nonReentrant whenNotPaused {
        require(amount >= minTransferAmount, "Amount below minimum");
        require(amount <= maxTransferAmount, "Amount above maximum");
        require(recipientOnSource != address(0), "Invalid recipient");

        // Pull wrapped tokens from the user to this bridge contract for burning
        // Requires user to have approved the bridge contract first
        require(wrappedToken.transferFrom(msg.sender, address(this), amount), "ERC20: transferFrom failed");

        uint256 currentNonce = bridgeNonce;
        bridgeNonce++; // Increment nonce for next request originating from this chain

        bytes32 requestId = relayerManager.generateRequestId(
            msg.sender,          // User initiating the burn on Sepolia
            recipientOnSource,   // Final recipient on Amoy
            amount,
            currentNonce,        // Use this bridge's internal nonce
            block.chainid,       // Source chain ID (Sepolia)
            SOURCE_CHAIN_ID      // Target chain ID (Amoy)
        );

        // Burn the tokens held by the bridge contract
        // Ensure this bridge contract has Burner role on the wrappedToken contract!
        // The burn function in Token.sol needs adjustment to allow burning from 'address(this)'
        // A better pattern: wrappedToken.burnFrom(address(this), amount); if the token supports it.
        // Or the bridge calls wrappedToken.approve(address(wrappedToken), amount) then wrappedToken.burn(address(this), amount)
        // Simplified direct call assuming bridge has rights & token allows burning its own balance:
        try wrappedToken.burn(address(this), amount) {
            // Emit event for relayers to pick up and trigger unlock on Amoy
            emit BurnInitiated(
                requestId,
                msg.sender,
                recipientOnSource,
                amount,
                currentNonce,
                block.chainid,
                SOURCE_CHAIN_ID
            );
        } catch {
            // If burn fails, try to return tokens to user? Or revert fully?
            // Returning tokens is complex due to potential reentrancy/griefing. Reverting is safer.
            revert("Burning failed"); 
            // If burn fails, the transferFrom still happened. Need to handle this state.
            // Safest: revert the whole transaction. Less safe: try sending back tokens.
            // require(wrappedToken.transfer(msg.sender, amount), "Burn failed, return transfer failed"); // Risky
        }
    }


    // --- Admin Functions ---

    function updateTransferLimits(
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlyRole(ADMIN_ROLE) {
        require(_minAmount <= _maxAmount, "Invalid limits");
        minTransferAmount = _minAmount;
        maxTransferAmount = _maxAmount;
        emit BridgeLimitsUpdated(_minAmount, _maxAmount);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

     // Allows admin to withdraw *any* ERC20 token accidentally sent
    function emergencyWithdraw(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
         require(to != address(0), "Invalid recipient");
         require(tokenAddress != address(0), "Invalid token address");
         
         IERC20 recoveryToken = IERC20(tokenAddress);
         uint256 balance = recoveryToken.balanceOf(address(this));
         require(amount <= balance, "Insufficient balance for withdrawal");

         require(recoveryToken.transfer(to, amount), "Emergency withdrawal failed");
    }

    // Allows admin to withdraw the *wrapped* token
    // CAUTION: This bypasses the standard bridge flow. Only for emergencies.
     function emergencyWithdrawWrappedToken(
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
         require(to != address(0), "Invalid recipient");
         uint256 balance = wrappedToken.balanceOf(address(this));
         require(amount <= balance, "Insufficient balance for withdrawal");
         require(wrappedToken.transfer(to, amount), "Emergency withdrawal failed");
         // Note: This doesn't burn the tokens, potentially breaking the 1:1 peg if not handled carefully off-chain.
    }

     // Function for admin to grant roles on the wrapped token if needed (e.g., if bridge needs explicit permission)
     // This depends heavily on the wrapped token's access control mechanism
     /*
     function grantTokenRoles(address tokenAdmin) external onlyRole(ADMIN_ROLE) {
         // Example assumes wrappedToken uses AccessControl with specific roles
         bytes32 MINTER_ROLE_ON_TOKEN = wrappedToken.MINTER_ROLE(); // Get role hash from token
         bytes32 BURNER_ROLE_ON_TOKEN = wrappedToken.BURNER_ROLE(); // Get role hash from token
         
         // This call would likely need to be made *by* the tokenAdmin account directly on the token contract
         // or the token contract needs a function allowing its admin to grant roles to others.
         // wrappedToken.grantRole(MINTER_ROLE_ON_TOKEN, address(this)); // Grant minter role to this bridge
         // wrappedToken.grantRole(BURNER_ROLE_ON_TOKEN, address(this)); // Grant burner role to this bridge
         // Placeholder: emitting an event might be more realistic for an off-chain admin action reminder
         emit RolesNeedGranting(address(wrappedToken), address(this));
     }
     event RolesNeedGranting(address indexed tokenContract, address indexed bridgeContract);
     */
}`;

// --- Quiz Data ---
const quizQuestions = [
    {
        question: "What is the primary purpose of a cross-chain bridge?",
        options: [
            "To increase the security of a single blockchain.",
            "To enable interoperability and asset transfer between different blockchains.",
            "To create new tokens on a blockchain.",
            "To reduce transaction fees on a specific blockchain."
        ],
        correctAnswer: "To enable interoperability and asset transfer between different blockchains."
    },
    {
        question: "In the provided 'BridgeAmoyV2' (Source Chain) contract, what does the `lockWithRelay` function do?",
        options: [
            "Mints new tokens on the source chain.",
            "Burns tokens on the source chain.",
            "Transfers tokens from the user to the bridge contract and emits an event for relayers.",
            "Directly sends tokens to the destination chain."
        ],
        correctAnswer: "Transfers tokens from the user to the bridge contract and emits an event for relayers."
    },
    {
        question: "In the provided 'BridgeSepoliaV2' (Destination Chain) contract using a lock-and-mint model, what does the `release` function typically do?",
        options: [
            "Locks tokens received from the source chain.",
            "Burns wrapped tokens on the destination chain.",
            "Mints new wrapped tokens to the recipient on the destination chain after verification.",
            "Updates the relayer Merkle root."
        ],
        correctAnswer: "Mints new wrapped tokens to the recipient on the destination chain after verification."
    },
    {
        question: "What is the role of the 'Relayer' in this bridge design?",
        options: [
            "To validate user identities.",
            "To deploy the bridge smart contracts.",
            "To monitor events on one chain and trigger corresponding actions on the other chain.",
            "To hold the private keys of the users."
        ],
        correctAnswer: "To monitor events on one chain and trigger corresponding actions on the other chain."
    },
    {
        question: "How does the 'RelayerManager' contract help secure the bridge?",
        options: [
            "By holding all the bridged assets.",
            "By generating unique request IDs.",
            "By verifying that the entity calling functions like `release` or `unlock` is an authorized relayer (using Merkle Proofs).",
            "By setting the gas price for transactions."
        ],
        correctAnswer: "By verifying that the entity calling functions like `release` or `unlock` is an authorized relayer (using Merkle Proofs)."
    },
    {
        question: "What does 'gasless transaction' mean in the context of this cross-chain bridge challenge for the *end-user*?",
        options: [
            "No gas fees are ever paid by anyone.",
            "The user pays gas on the source chain, but the relayer pays the gas for the transaction on the destination chain.",
            "The smart contract pays its own gas fees.",
            "Transactions are processed off-chain."
        ],
        correctAnswer: "The user pays gas on the source chain, but the relayer pays the gas for the transaction on the destination chain."
    }
];


function CrossChainBridgeLab() {
    // --- State Variables ---
    const [userAnswers, setUserAnswers] = useState({});
    const [quizScore, setQuizScore] = useState(null);
    const [showQuizFeedback, setShowQuizFeedback] = useState(false);

    // Mock Challenge State
    const [mockAmoyBalance, setMockAmoyBalance] = useState(0);
    const [mintAmount, setMintAmount] = useState(100); // Default mint amount
    const [transferAmount, setTransferAmount] = useState(10);
    const [recipientAddress, setRecipientAddress] = useState("0xRecipientOnSepolia..."); // Mock recipient
    const [bridgeStatus, setBridgeStatus] = useState([]); // Array of status messages
    const [isBridging, setIsBridging] = useState(false);
    const [challengeSolved, setChallengeSolved] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // --- Functions ---

    // Quiz Functions
    const handleAnswerChange = (questionIndex, answer) => {
        setUserAnswers({
            ...userAnswers,
            [questionIndex]: answer
        });
        setShowQuizFeedback(false); // Hide feedback when changing answers
        setQuizScore(null);
    };

    const submitQuiz = () => {
        let score = 0;
        quizQuestions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                score++;
            }
        });
        setQuizScore(score);
        setShowQuizFeedback(true);
    };

    // Mock Challenge Functions
    const handleMint = () => {
        setErrorMessage('');
        setBridgeStatus([]);
        const amount = parseInt(mintAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            setErrorMessage("Invalid mint amount.");
            return;
        }
        setMockAmoyBalance(prev => prev + amount);
         setBridgeStatus(prev => [...prev, `Minted ${amount} MockAmoyTokens (New Balance: ${mockAmoyBalance + amount})`]);
    };

    const handleBridge = async () => {
        setErrorMessage('');
        setBridgeStatus(['Initiating bridge transfer...']);
        setIsBridging(true);
        setChallengeSolved(false);

        const amountToBridge = parseInt(transferAmount, 10);

        if (isNaN(amountToBridge) || amountToBridge <= 0) {
            setErrorMessage("Invalid transfer amount.");
            setBridgeStatus([]);
            setIsBridging(false);
            return;
        }

        if (amountToBridge > mockAmoyBalance) {
            setErrorMessage("Insufficient balance to bridge.");
            setBridgeStatus([]);
            setIsBridging(false);
            return;
        }

        if (!recipientAddress || recipientAddress.length < 10) { // Basic validation
             setErrorMessage("Please enter a valid recipient address.");
             setBridgeStatus([]);
             setIsBridging(false);
             return;
        }


        // 1. Simulate Lock on Amoy
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay/processing
        const newAmoyBalance = mockAmoyBalance - amountToBridge;
        setMockAmoyBalance(newAmoyBalance);
        const lockTimestamp = Date.now(); // Use timestamp as a mock nonce
        const mockRequestId = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`; // Fake request ID

        setBridgeStatus(prev => [
            ...prev,
            `Step 1: [Amoy Chain Simulation] Called lockWithRelay(${amountToBridge}, ${recipientAddress}).`,
            `Step 1a: Tokens transferred from User to BridgeAmoyV2 Contract. Your Balance: ${newAmoyBalance}`,
            `Step 1b: LockRequested Event Emitted: (ID: ${mockRequestId}, User: MockUser, Recipient: ${recipientAddress}, Amount: ${amountToBridge}, Nonce: ${lockTimestamp}, Source: ${mockAmoyChainId}, Target: ${mockSepoliaChainId})`
        ]);

        // 2. Simulate Relayer Action
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBridgeStatus(prev => [
            ...prev,
            `Step 2: [Relayer Simulation] Detected LockRequested event (ID: ${mockRequestId}). Preparing transaction for Sepolia...`,
            `Step 2a: Generating Merkle Proof for Relayer address (Proof: [mock_proof_data])...` // Mock proof data
        ]);

        // 3. Simulate Release on Sepolia
        await new Promise(resolve => setTimeout(resolve, 2000));
        setBridgeStatus(prev => [
            ...prev,
            `Step 3: [Sepolia Chain Simulation] Relayer calling release(${mockRequestId}, MockUser, ${recipientAddress}, ${amountToBridge}, ${lockTimestamp}, ${mockAmoyChainId}, ${mockSepoliaChainId}, [mock_proof_data])...`,
            `Step 3a: RelayerManager verified relayer proof.`,
            `Step 3b: BridgeSepoliaV2 verified request details and checked if processed.`,
            `Step 3c: BridgeSepoliaV2 calling wrappedToken.mint(${recipientAddress}, ${amountToBridge}).`,
             `Step 3d: ReleaseCompleted Event Emitted.`
        ]);

        // 4. Final Confirmation
        await new Promise(resolve => setTimeout(resolve, 500));
        setBridgeStatus(prev => [
            ...prev,
            `Step 4: [User Confirmation] Bridge successful! ${amountToBridge} wrapped tokens minted to ${recipientAddress} on Sepolia (Simulated).`,
            `--- Gasless Aspect: You paid gas for Step 1 on Amoy. The Relayer paid gas for Step 3 on Sepolia. ---`
        ]);

        setIsBridging(false);
        setChallengeSolved(true);
    };


    // --- Render ---
    return (
        <div className="lab-container cross-chain-bridge-lab">
            <h1>Lab: Cross-Chain Bridging & Gasless Transactions</h1>

            {/* Introduction and Concepts */}
            <section className="lab-section">
                <h2>Concept: Cross-Chain Bridges</h2>
                <p>Blockchains operate in isolated environments. A cross-chain bridge acts like a digital connection, enabling communication and the transfer of assets or data between different blockchain networks (e.g., Ethereum Mainnet and Polygon, or testnets like Amoy and Sepolia).</p>
                <h3>Why Use Bridges?</h3>
                <ul>
                    <li><strong>Interoperability:</strong> Allows users to access dApps or liquidity on other chains.</li>
                    <li><strong>Asset Transfer:</strong> Move native tokens or representations (wrapped tokens) between networks.</li>
                    <li><strong>Scalability:</strong> Utilize Layer 2 solutions or other chains for faster/cheaper transactions.</li>
                </ul>
                <h3>Common Mechanism: Lock/Mint & Burn/Unlock</h3>
                <p>The contracts provided demonstrate a common bridge pattern:</p>
                <ol>
                    <li><strong>Amoy to Sepolia (Lock & Mint):</strong>
                        <ul>
                            <li>A user wants to move TokenA from Amoy to Sepolia.</li>
                            <li>They call `lockWithRelay` on the Amoy Bridge contract, specifying the amount and their Sepolia recipient address.</li>
                            <li>The Amoy Bridge takes custody of the user's TokenA (`transferFrom`) and emits a `LockRequested` event.</li>
                            <li>A <strong>Relayer</strong> (an off-chain service) monitors this event.</li>
                            <li>The Relayer verifies the event and calls the `release` function on the Sepolia Bridge contract.</li>
                            <li>The Sepolia Bridge verifies the Relayer (using `RelayerManager` and Merkle Proofs) and checks the request hasn't been processed.</li>
                            <li>If valid, the Sepolia Bridge **mints** an equivalent amount of a "wrapped" version of TokenA (WrappedTokenA) to the recipient on Sepolia.</li>
                        </ul>
                    </li>
                    <li><strong>Sepolia to Amoy (Burn & Unlock):</strong>
                        <ul>
                           <li>A user wants to move WrappedTokenA from Sepolia back to Amoy.</li>
                           <li>They call `burnWithRelay` on the Sepolia Bridge, specifying the amount and their Amoy recipient address.</li>
                           <li>The Sepolia Bridge takes the user's WrappedTokenA (`transferFrom`) and **burns** it, emitting a `BurnInitiated` event (or similar).</li>
                           <li>A Relayer monitors this event.</li>
                           <li>The Relayer calls the `unlock` function on the Amoy Bridge contract.</li>
                           <li>The Amoy Bridge verifies the Relayer and the request.</li>
                           <li>If valid, the Amoy Bridge releases the original TokenA (which it held in custody) back to the recipient on Amoy.</li>
                        </ul>
                    </li>
                </ol>
                 <h3>Relayers and Gasless Transactions</h3>
                 <p>Relayers are crucial. They are off-chain entities that listen for events on one chain and submit transactions on the other. In our scenario:</p>
                 <ul>
                    <li>The user initiates the `lockWithRelay` transaction on Amoy and pays the gas fee for *that* transaction.</li>
                    <li>The Relayer pays the gas fee for the `release` transaction on Sepolia.</li>
                 </ul>
                 <p>From the **user's perspective on the destination chain (Sepolia)**, the arrival of tokens appears "gasless" because they didn't have to submit a transaction there themselves. The Relayer covered the cost, often recouping it through fees, arbitrage, or other mechanisms.</p>
                 <h3>Security Considerations</h3>
                 <p>Bridges are complex and involve significant security risks:</p>
                 <ul>
                    <li><strong>Smart Contract Bugs:</strong> Vulnerabilities in bridge contracts can lead to loss of funds (e.g., Reentrancy, logic errors). OpenZeppelin contracts (`ReentrancyGuard`, `AccessControl`, `Pausable`) help mitigate some risks.</li>
                    <li><strong>Relayer Security:</strong> Compromised relayers could potentially submit fraudulent transactions or censor valid ones. The `RelayerManager` with Merkle Proofs ensures only authorized relayers can execute actions.</li>
                    <li><strong>Trust Assumptions:</strong> Users often trust the bridge operators and relayers. Decentralized bridge designs aim to minimize trust.</li>
                    <li><strong>Chain Reorganizations:</strong> Events on one chain might be reverted, causing issues if the corresponding action on the other chain already occurred.</li>
                 </ul>
            </section>

            {/* Quiz Section */}
            <section className="lab-section">
                <h2>Quiz: Test Your Understanding</h2>
                {quizQuestions.map((q, index) => (
                    <div key={index} className="quiz-question">
                        <p><strong>{index + 1}. {q.question}</strong></p>
                        {q.options.map((option, i) => (
                            <div key={i} className="quiz-option">
                                <input
                                    type="radio"
                                    id={`q${index}_option${i}`}
                                    name={`question_${index}`}
                                    value={option}
                                    onChange={() => handleAnswerChange(index, option)}
                                    checked={userAnswers[index] === option}
                                />
                                <label htmlFor={`q${index}_option${i}`}>{option}</label>
                            </div>
                        ))}
                        {showQuizFeedback && (
                            <p className={`feedback ${userAnswers[index] === q.correctAnswer ? 'correct' : 'incorrect'}`}>
                                {userAnswers[index] === q.correctAnswer ? 'Correct!' : `Incorrect. Correct Answer: ${q.correctAnswer}`}
                            </p>
                        )}
                    </div>
                ))}
                <button onClick={submitQuiz} disabled={Object.keys(userAnswers).length !== quizQuestions.length}>Submit Quiz</button>
                {quizScore !== null && (
                    <p className="quiz-score">Your Score: {quizScore} out of {quizQuestions.length}</p>
                )}
            </section>

             {/* Code Examples */}
            <section className="lab-section">
                <h2>Code Examples</h2>
                <p>These are the core contracts involved in the bridge mechanism (simplified for clarity).</p>

                <h3>Token Contract (`Token.sol`)</h3>
                <p>A standard ERC20 token with minting, burning, and pausing capabilities, controlled by roles.</p>
                <pre className="code-block"><code>{tokenCode}</code></pre>

                <h3>Relayer Manager (`RelayerManager.sol`)</h3>
                <p>Manages the list of authorized relayers using a Merkle root and provides verification functions.</p>
                 <pre className="code-block"><code>{relayerManagerCode}</code></pre>

                <h3>Source Bridge (`BridgeAmoyV2.sol`)</h3>
                <p>Handles locking tokens on the source chain (Amoy) and potentially unlocking tokens coming back from the destination chain.</p>
                 <pre className="code-block"><code>{bridgeAmoyCode}</code></pre>

                 <h3>Destination Bridge (`BridgeSepoliaV2.sol`)</h3>
                 <p>Handles releasing (minting) wrapped tokens on the destination chain (Sepolia) and potentially burning tokens to send back to the source chain.</p>
                 <pre className="code-block"><code>{bridgeSepoliaCode}</code></pre>
            </section>


            {/* Challenge Section */}
            <section className="lab-section">
                <h2>Challenge: Mock Gasless ERC20 Transfer</h2>
                <p><strong>Goal:</strong> Simulate bridging a custom ERC20 token ("MockAmoyToken") from the simulated Amoy network to the simulated Sepolia network using the lock-and-mint mechanism. Observe the steps involved in a "gasless" transfer from the user's perspective on the destination chain.</p>
                <p><strong>Instructions:</strong></p>
                <ol>
                    <li>Mint some MockAmoyTokens to simulate having tokens on the source chain.</li>
                    <li>Enter an amount to bridge and a mock recipient address for the Sepolia network.</li>
                    <li>Click "Bridge Tokens" and observe the simulated steps.</li>
                </ol>

                <div className="challenge-area">
                    <h3>Your Mock Amoy Wallet</h3>
                    <p><strong>MockAmoyToken Balance:</strong> {mockAmoyBalance} MAT</p>
                     <div className="mint-controls">
                         <label htmlFor="mintAmount">Amount to Mint:</label>
                         <input
                             type="number"
                             id="mintAmount"
                             value={mintAmount}
                             onChange={(e) => setMintAmount(e.target.value)}
                             min="1"
                         />
                         <button onClick={handleMint} disabled={isBridging}>Mint MockAmoyTokens</button>
                    </div>

                    <hr />

                    <h3>Bridge Interface (Amoy -&gt; Sepolia)</h3>
                     <div className="bridge-controls">
                        <div>
                             <label htmlFor="transferAmount">Amount to Bridge:</label>
                             <input
                                 type="number"
                                 id="transferAmount"
                                 value={transferAmount}
                                 onChange={(e) => setTransferAmount(e.target.value)}
                                 min="1"
                                 disabled={isBridging}
                             />
                         </div>
                         <div>
                             <label htmlFor="recipientAddress">Recipient Address (on Sepolia):</label>
                             <input
                                 type="text"
                                 id="recipientAddress"
                                 value={recipientAddress}
                                 onChange={(e) => setRecipientAddress(e.target.value)}
                                 placeholder="e.g., 0x123...abc"
                                 disabled={isBridging}
                                 style={{ minWidth: '300px' }}
                             />
                         </div>
                         <button onClick={handleBridge} disabled={isBridging || mockAmoyBalance <= 0}>
                             {isBridging ? 'Bridging...' : 'Bridge Tokens'}
                         </button>
                    </div>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="bridge-status-log">
                        <h4>Bridge Status Log:</h4>
                        {bridgeStatus.length === 0 && !isBridging && <p>Status log will appear here...</p>}
                        {bridgeStatus.map((status, index) => (
                            <p key={index}>{status}</p>
                        ))}
                        {challengeSolved && <p className="success-message">✅ Challenge Complete! You successfully simulated the bridging process.</p>}
                    </div>
                </div>
            </section>

            {/* Real World Execution */}
             <section className="lab-section">
                 <h2>Real-World Execution Notes</h2>
                 <p>To execute this in a real-world scenario (e.g., on testnets Amoy and Sepolia):</p>
                 <ol>
                    <li><strong>Deploy Contracts:</strong>
                        <ul>
                            <li>Deploy the `Token.sol` contract (or use an existing one) on the source chain (Amoy). Let's call this `AmoyToken`.</li>
                            <li>Deploy a version of `Token.sol` on the destination chain (Sepolia) to act as the wrapped token. Let's call this `WrappedAmoyToken`. Crucially, its `MINTER_ROLE` and `BURNER_ROLE` must be grantable.</li>
                            <li>Deploy the `RelayerManager.sol` contract on *either* chain (or even a third chain). Both bridge contracts will need its address. Set up the initial Merkle root with authorized relayer addresses.</li>
                            <li>Deploy `BridgeAmoyV2.sol` on Amoy, providing addresses for `AmoyToken`, `RelayerManager`, admin, and transfer limits.</li>
                             <li>Deploy `BridgeSepoliaV2.sol` on Sepolia, providing addresses for `WrappedAmoyToken`, `RelayerManager`, admin, and transfer limits.</li>
                        </ul>
                    </li>
                     <li><strong>Grant Roles:</strong>
                        <ul>
                           <li>The admin/deployer of `WrappedAmoyToken` MUST grant the `MINTER_ROLE` and `BURNER_ROLE` to the deployed `BridgeSepoliaV2` contract address. This allows the Sepolia bridge to mint/burn wrapped tokens.</li>
                           <li>Ensure appropriate admin, operator, and pauser roles are set on the Bridge and RelayerManager contracts.</li>
                        </ul>
                     </li>
                     <li><strong>Set Up Relayer:</strong>
                        <ul>
                            <li>Run an off-chain service (the Relayer).</li>
                            <li>Configure the Relayer with a wallet that has its address included in the `RelayerManager`'s Merkle tree. Ensure this wallet has funds (e.g., Sepolia ETH) to pay gas fees on the destination chain.</li>
                            <li>The Relayer needs to subscribe to `LockRequested` events on the `BridgeAmoyV2` contract and `BurnInitiated` events on the `BridgeSepoliaV2` contract.</li>
                             <li>When a `LockRequested` event is detected, the Relayer constructs the Merkle proof for its own address, gathers event data, and calls the `release` function on `BridgeSepoliaV2`.</li>
                             <li>When a `BurnInitiated` event is detected, the Relayer does the same but calls the `unlock` function on `BridgeAmoyV2`.</li>
                        </ul>
                     </li>
                     <li><strong>User Interaction (Frontend):</strong>
                         <ul>
                            <li>Connect the user's wallet (e.g., MetaMask) to the source chain (Amoy).</li>
                            <li>The user must first `approve` the `BridgeAmoyV2` contract to spend their `AmoyToken`.</li>
                            <li>The user calls `lockWithRelay` on `BridgeAmoyV2` via the frontend, paying gas on Amoy.</li>
                            <li>The frontend can monitor the `ReleaseCompleted` event on `BridgeSepoliaV2` (or use the relayer/backend API) to confirm the transfer. The user does *not* send a transaction on Sepolia.</li>
                         </ul>
                     </li>
                 </ol>
             </section>

        </div>
    );
}

export default CrossChainBridgeLab;