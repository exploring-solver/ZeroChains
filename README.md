﻿# Zero Chain: Gamified Blockchain Learning Platform

Zero Chain is a gamified learning platform designed to help developers understand and solve blockchain challenges through an interactive, hands-on approach. The platform offers various levels of challenges that progressively teach important blockchain concepts from basic cryptography to advanced smart contract security.

## Project Overview

Zero Chain combines education with gamification to make learning blockchain concepts engaging and effective. Users progress through levels, earn points, and unlock achievements while mastering critical blockchain development skills.

The platform features:
- 5 core learning levels with interactive challenges
- Premium subscription labs for advanced topics
- A comprehensive learning path from basics to expert concepts
- Hands-on approach with real smart contract interactions
- Leaderboard to track progress and compare with other learners

## Setup Instructions

To get started with Zero Chain locally:

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Start a local Hardhat node:
   ```
   npx hardhat node
   ```

4. Run the deployment pipeline to set up contracts:
   ```
   npm run pipeline
   ```
   (add environment variables if missing)

5. Start the frontend:
   ```
   cd frontend
   npm run dev
   ```

All set! The levels are ready to be solved.

## Learning Path

### Core Levels

#### Level 1: Genesis Signer
**Objective**: Understand digital signatures (ECDSA) and verify transaction authenticity.
- Learn how blockchain relies on cryptographic signatures for security
- Implement verification of Ethereum signatures
- Understand how wallets sign messages and how smart contracts verify these signatures

#### Level 2: Hash Forge
**Objective**: Explore cryptographic hashing and find inputs matching specific hash patterns.
- Master Keccak-256 hashing fundamentals
- Understand how hash functions work in blockchain systems
- Learn about preimage resistance by finding inputs that produce specific hash outputs

#### Level 3: Merkle Maze
**Objective**: Understand Merkle trees and validate data inclusion using Merkle proofs.
- Learn how Merkle trees enable efficient verification of data inclusion
- Implement Merkle proof validation
- Understand how this technology powers scalable blockchain data structures

#### Level 4: Reentrancy Labyrinth
**Objective**: Identify, exploit, and fix a common smart contract vulnerability: Reentrancy.
- Understand one of the most critical smart contract vulnerabilities
- Learn to identify vulnerable code patterns
- Implement the Checks-Effects-Interactions pattern to secure contracts
- Experience both the attack and defense perspectives

#### Level 5: Consensus Arena
**Objective**: Participate in a simulated Proof-of-Stake consensus mechanism.
- Understand how blockchain networks reach consensus
- Learn about staking, validation, and voting in PoS systems
- Participate in multiple consensus rounds to finalize blocks

### Premium Labs

#### Gasless Transaction Forwarder
**Objective**: Build a system that enables users to interact with blockchain without paying gas fees.
- Implement meta-transactions using EIP-712 typed signatures
- Create a secure relayer architecture
- Understand signature verification and replay protection

#### Cross Chain Asset Transfer Bridge
**Objective**: Create a secure bridge to transfer assets between different blockchain networks.
- Implement cross-chain messaging and asset transfer
- Use Merkle proofs for efficient verification
- Build secure relayer systems with proper authorization

## Remote Execution Documentation

Zero Chain provides remote execution capabilities to help users solve challenges without needing to set up a complex local environment. Each level includes:

- Detailed documentation on the challenge objectives
- Code templates that can be modified and executed
- Remote script execution against the challenge contracts
- Real-time feedback on challenge completion

The platform guides users through setting up their environment variables, connecting their wallets, and executing their solutions against the deployed smart contracts.

## Security Focus

Zero Chain emphasizes security best practices throughout the learning journey:
- Identifying common vulnerabilities in smart contracts
- Understanding cryptographic principles underlying blockchain security
- Implementing proper signature verification and validation
- Building systems resistant to common attack vectors
- Following established patterns for secure smart contract development

By completing all levels and premium labs, users will gain a comprehensive understanding of blockchain development with a strong emphasis on security principles essential for production environments.
