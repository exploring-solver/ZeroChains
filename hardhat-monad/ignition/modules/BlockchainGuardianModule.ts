// ignition/modules/BlockchainGuardianModule.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const BlockchainGuardianModule = buildModule("BlockchainGuardianModule", (m) => {
  // Deploy main game contract
  const gameContract = m.contract("BlockchainGuardianGame", []);

  // Deploy Level 1: Genesis Block
  const level1Contract = m.contract("Level1Genesis", [gameContract]);

  // Register Level 1 in the game contract
  m.call(gameContract, "setLevelContract", [1n, level1Contract], {
    id: "registerLevel1Contract"
  });

  // Deploy Level 2: Hash Fortress
  // Create a target prefix hash
  const targetPrefixHash = "0x1234567800000000000000000000000000000000000000000000000000000000";
  const level2Contract = m.contract("Level2HashFortress", [
    gameContract,
    targetPrefixHash
  ]);

  // Register Level 2 in the game contract
  m.call(gameContract, "setLevelContract", [2n, level2Contract], {
    id: "registerLevel2Contract"
  });

  // Deploy Level 3: Merkle Maze
  // Sample Merkle root for the puzzle
  const sampleRoot = "0x7465737400000000000000000000000000000000000000000000000000000000";
  const level3Contract = m.contract("Level3MerkleMaze", [
    gameContract,
    sampleRoot
  ]);

  // Register Level 3 in the game contract
  m.call(gameContract, "setLevelContract", [3n, level3Contract], {
    id: "registerLevel3Contract"
  });

  // Deploy Level 4: Reentrancy Labyrinth
  // Fund it with some ETH for the reentrancy puzzle
  const level4Contract = m.contract("Level4ReentrancyLabyrinth", [gameContract], {
    value: parseEther("0.5")
  });

  // Register Level 4 in the game contract
  m.call(gameContract, "setLevelContract", [4n, level4Contract], {
    id: "registerLevel4Contract"
  });

  // Deploy Level 5: Consensus Arena
  const level5Contract = m.contract("Level5ConsensusArena", [gameContract]);

  // Register Level 5 in the game contract
  m.call(gameContract, "setLevelContract", [5n, level5Contract], {
    id: "registerLevel5Contract"
  });

  // Return all contract instances for access after deployment
  return {
    gameContract,
    level1Contract,
    level2Contract,
    level3Contract,
    level4Contract,
    level5Contract
  };
});

export default BlockchainGuardianModule;