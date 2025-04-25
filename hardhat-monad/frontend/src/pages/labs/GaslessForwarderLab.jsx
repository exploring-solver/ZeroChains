// src/pages/GaslessForwarderLab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Removed useParams as not used in this version
import {
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar, // For showing mock transaction status
  LinearProgress, // For showing mock transaction progress
} from '@mui/material';
import {
  LocalGasStation,
  Code,
  CheckCircle,
  School,
  ArrowForward,
  ArrowBack,
  Terminal,
  Info,
  Help,
  EmojiEvents,
  AccountBalanceWallet,
  Construction,
  LightbulbOutlined,
  Send,
  ReceiptLong, // Icon for transaction/receipt
  PublishedWithChanges, // Icon for relaying
  Fingerprint, // Icon for signing
  AddCircleOutline, // Icon for minting
} from '@mui/icons-material';

// Assuming CodeEditor component exists and is imported correctly
import CodeEditor from '../../components/game/CodeEditor';
// Assuming CompletionDialog component exists (though not used in this mock version)
// import CompletionDialog from '../components/game/CompletionDialog';

// --- Data (Included directly for completeness, move to separate files ideally) ---

// Quiz Questions
const quizQuestions = {
  0: [ // Introduction Quiz
    {
      id: 'q1',
      question: 'What is the main problem meta-transactions (gasless transactions) aim to solve?',
      options: [
        'Slow transaction speeds',
        'High smart contract deployment costs',
        'Users needing native tokens (like ETH) to pay for gas fees',
        'Lack of privacy on the blockchain'
      ],
      correctAnswer: 2 // Index of correct option
    },
    {
      id: 'q2',
      question: 'In a typical meta-transaction flow, who pays the actual gas fee to the network?',
      options: [
        'The user sending the transaction',
        'The smart contract receiving the call',
        'A third-party relayer',
        'The miners/validators directly, without fees'
      ],
      correctAnswer: 2
    },
  ],
  2: [ // Signature Mechanism Quiz
    {
      id: 'q1',
      question: 'What is the primary benefit of using EIP-712 signatures over simple message signing (eth_sign)?',
      options: [
        'They use less gas',
        'They are easier for developers to implement',
        'They allow users to see structured, readable data in their wallets before signing',
        'They can only be used for token approvals'
      ],
      correctAnswer: 2
    },
    {
      id: 'q2',
      question: 'What component in EIP-712 helps prevent signature replay attacks across different contracts or chains?',
      options: [
        'The Nonce',
        'The Type Hash',
        'The Domain Separator',
        'The Signature (r, s, v components)'
      ],
      correctAnswer: 2
    },
    {
        id: 'q3',
        question: 'Which JavaScript method is commonly used with ethers.js to sign EIP-712 typed data?',
        type: 'text', // Text input question
        correctAnswer: '_signTypedData' // Expecting this specific method name
    }
  ],
   3: [ // Relayer Quiz
    {
      id: 'q1',
      question: 'What is a primary responsibility of a relayer service?',
      options: [
        'Generating private keys for users',
        'Validating user signatures and submitting transactions to the blockchain',
        'Deciding the consensus rules of the network',
        'Storing user token balances off-chain'
      ],
      correctAnswer: 1
    },
    {
      id: 'q2',
      question: 'Why is replay protection (e.g., using nonces) crucial in a meta-transaction system?',
      options: [
        'To ensure transactions are processed in the correct order',
        'To prevent network congestion',
        'To stop a malicious actor from submitting the same signed request multiple times',
        'To make signatures smaller'
      ],
      correctAnswer: 2
    },
  ]
};

// Code Examples
const eip712ClientCode = `// Client-side: Creating an EIP-712 signature with ethers.js

async function signGaslessTransfer(signer, verifyingContractAddress, tokenAddress, recipient, amount) {
  const userAddress = await signer.getAddress();
  const chainId = await signer.getChainId();

  // 1. Get the user's current nonce from the Forwarder/Token contract
  // (Requires contract instance with nonce function)
  // const forwarderContract = new ethers.Contract(verifyingContractAddress, abi, signer);
  // const nonce = await forwarderContract.nonces(userAddress);
  const nonce = 0; // Mock nonce for example

  // 2. Define the EIP-712 domain
  const domain = {
    name: 'YourDAppName', // Should match the name in your contract's domain separator
    version: '1',       // Should match the version
    chainId: chainId,
    verifyingContract: verifyingContractAddress // Address of the contract that will verify the signature
  };

  // 3. Define the EIP-712 types for your specific action
  const types = {
    ForwardRequest: [ // The primary type
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
      // Add other fields like 'gas', 'data' if your forwarder supports them
    ]
  };

  // 4. Define the message values
  const message = {
    from: userAddress,
    to: recipient,
    token: tokenAddress,
    value: amount.toString(), // Ensure amount is a string if it's a BigNumber
    nonce: nonce.toString()   // Ensure nonce is correct type
  };

  try {
    // 5. Sign the typed data
    const signature = await signer._signTypedData(domain, types, message);
    console.log("Signature:", signature);

    // 6. Prepare the request for the relayer
    const forwardRequest = { ...message, signature };
    return forwardRequest;

  } catch (error) {
    console.error("Signing failed:", error);
    throw error; // Re-throw for handling upstream
  }
}

// Example Usage (replace with actual values)
// const signer = provider.getSigner(); // Get signer from wallet connection
// const forwarderAddress = "0x...";
// const tokenAddress = "0x...";
// const recipientAddress = "0x...";
// const transferAmount = ethers.utils.parseUnits("10", 18); // 10 tokens with 18 decimals

// signGaslessTransfer(signer, forwarderAddress, tokenAddress, recipientAddress, transferAmount)
//   .then(request => {
//     console.log("Signed Request:", request);
//     // Now send 'request' to your relayer endpoint
//   });
`;

const relayerServerCode = `// Server-side: Basic Relayer Endpoint Example (Node.js/Express)

const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config(); // For private keys, RPC URLs

const app = express();
app.use(express.json());

// --- Configuration ---
const PORT = process.env.PORT || 3001; // Relayer port
const RPC_URL = process.env.RPC_URL; // e.g., Sepolia RPC
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const FORWARDER_CONTRACT_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS;
const FORWARDER_ABI = [ /* --- PASTE FORWARDER ABI HERE --- */ ]; // Crucial!

if (!RPC_URL || !RELAYER_PRIVATE_KEY || !FORWARDER_CONTRACT_ADDRESS) {
  console.error("Missing required environment variables (RPC_URL, RELAYER_PRIVATE_KEY, FORWARDER_CONTRACT_ADDRESS)");
  process.exit(1);
}

// --- Setup Ethers ---
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const forwarderContract = new ethers.Contract(FORWARDER_CONTRACT_ADDRESS, FORWARDER_ABI, relayerWallet);

console.log(\`Relayer Service running. Relayer Address: \${relayerWallet.address}\`);
console.log(\`Forwarder Contract: \${FORWARDER_CONTRACT_ADDRESS}\`);

// --- API Endpoint ---
app.post('/relay', async (req, res) => {
  const { from, to, token, value, nonce, signature } = req.body;

  console.log("Received relay request:", req.body);

  // --- Basic Validation (Add more robust checks in production!) ---
  if (!from || !to || !token || !value || nonce === undefined || !signature) {
    return res.status(400).json({ success: false, error: "Missing required fields in request." });
  }

  try {
    // --- Optional: Off-chain Signature Verification (Saves gas if invalid) ---
    // You can reconstruct the EIP-712 digest here and use ethers.utils.recoverAddress
    // const recoveredAddress = ethers.utils.verifyTypedData(domain, types, message, signature);
    // if (recoveredAddress.toLowerCase() !== from.toLowerCase()) {
    //   return res.status(400).json({ success: false, error: "Invalid signature (off-chain check)." });
    // }
    // console.log("Off-chain signature check passed.");

    // --- Prepare the transaction data for the forwarder's execute function ---
    // The exact function name and parameters depend on YOUR forwarder contract's ABI
    const forwarderFunctionName = 'execute'; // Replace if different
    const txData = [
        from, to, token, value, nonce, signature // Ensure order matches contract function
    ];

    // --- Estimate Gas (Optional but recommended) ---
    // const estimatedGas = await forwarderContract.estimateGas[forwarderFunctionName](...txData);
    // console.log(\`Estimated Gas: \${estimatedGas.toString()}\`);

    // --- Send the transaction via the relayer ---
    console.log("Submitting transaction to forwarder contract...");
    const tx = await forwarderContract[forwarderFunctionName](...txData, {
      // gasLimit: estimatedGas.mul(12).div(10), // Add a buffer (e.g., 20%)
      // gasPrice: await provider.getGasPrice(), // Or use EIP-1559 fields
    });

    console.log(\`Transaction submitted by relayer. Hash: \${tx.hash}\`);

    // --- Respond immediately (don't wait for confirmation) ---
    res.status(200).json({
      success: true,
      message: "Transaction relayed successfully.",
      txHash: tx.hash
    });

    // --- Optional: Monitor transaction confirmation asynchronously ---
    // tx.wait().then(receipt => {
    //   console.log(\`Transaction confirmed! Block: \${receipt.blockNumber}\`);
    // }).catch(error => {
    //   console.error(\`Transaction failed on-chain: \${tx.hash}\`, error);
    // });

  } catch (error) {
    console.error("Relay failed:", error);
    res.status(500).json({
      success: false,
      error: error.reason || error.message || "An internal server error occurred."
    });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(\`Relayer listening on port \${PORT}\`);
});
`;

// Challenge Data (Mock)
const mockChallenge = {
  tokenName: "MockGaslessToken",
  tokenSymbol: "MGT",
  userAddress: "0xUserWalletAddress...", // Placeholder
  forwarderAddress: "0xMockForwarderContract...", // Placeholder
  abiSnippet: `[
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "execute", // The function the relayer calls
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ],
    "name": "nonces", // Function to get user's nonce
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  }
  // ... other relevant ABI parts (like domain separator info if needed)
]`
};

// --- Component ---

const GaslessForwarderLab = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // For future async operations
  const [error, setError] = useState(null);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState({}); // Combined state for all quizzes
  const [quizSubmitted, setQuizSubmitted] = useState({}); // Track submission per step
  const [quizPassed, setQuizPassed] = useState({}); // Track pass status per step

  // Mock Challenge State
  const [mockTokenBalance, setMockTokenBalance] = useState(0);
  const [mockRecipient, setMockRecipient] = useState('');
  const [mockAmount, setMockAmount] = useState('');
  const [mockTxStatus, setMockTxStatus] = useState(''); // e.g., 'idle', 'signing', 'relaying', 'confirmed', 'failed'
  const [mockTxMessage, setMockTxMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [progress, setProgress] = useState(0);


  // --- Handlers ---

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleQuizAnswerChange = (stepId, questionId, value) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${stepId}-${questionId}`]: value // Unique key per step/question
    }));
    // Clear error for this question if user changes answer
    // (Error display logic not fully implemented here, but good practice)
  };

  const handleQuizSubmit = (stepId) => {
    const questions = quizQuestions[stepId] || [];
    let correctCount = 0;
    let allAnswered = true;
    const currentStepAnswers = {};

    questions.forEach(q => {
        const answerKey = `${stepId}-${q.id}`;
        const userAnswer = quizAnswers[answerKey]?.trim();
        currentStepAnswers[q.id] = userAnswer; // Store for checking

        if (userAnswer === undefined || userAnswer === '') {
            allAnswered = false;
        } else {
            let isCorrect = false;
            if (q.type === 'text') {
                isCorrect = userAnswer.toLowerCase().includes(q.correctAnswer.toLowerCase());
            } else { // options
                isCorrect = parseInt(userAnswer) === q.correctAnswer;
            }
            if (isCorrect) correctCount++;
        }
    });

    setQuizSubmitted(prev => ({ ...prev, [stepId]: true }));

    if (!allAnswered) {
        setError(`Please answer all questions for Step ${stepId + 1}.`);
        setQuizPassed(prev => ({ ...prev, [stepId]: false }));
        return;
    }

    setError(null); // Clear general error
    const passThreshold = Math.ceil(questions.length * 0.75); // Pass >= 75%
    const passed = correctCount >= passThreshold;
    setQuizPassed(prev => ({ ...prev, [stepId]: passed }));

    if (passed) {
        // Optionally auto-advance or enable next button
        // handleNext();
    } else {
        setError(`Some answers are incorrect for Step ${stepId + 1}. Please review.`);
    }
  };

  // Mock Challenge Handlers
  const handleMintMockTokens = () => {
    const amount = Math.floor(Math.random() * 1000) + 100; // Mint random amount
    setMockTokenBalance(prev => prev + amount);
    setMockTxStatus('idle');
    setMockTxMessage(`Minted ${amount} ${mockChallenge.tokenSymbol}!`);
    setSnackbarOpen(true);
  };

  const handleMockTransfer = async () => {
    if (!mockRecipient || !mockAmount || isNaN(parseFloat(mockAmount)) || parseFloat(mockAmount) <= 0) {
      setMockTxMessage('Please enter a valid recipient address and amount.');
      setSnackbarOpen(true);
      return;
    }
    const amountToSend = parseFloat(mockAmount);
    if (amountToSend > mockTokenBalance) {
       setMockTxMessage('Insufficient mock token balance.');
       setSnackbarOpen(true);
       return;
    }

    setMockTxStatus('signing');
    setProgress(0);
    setMockTxMessage('Signing message off-chain...');
    setSnackbarOpen(true);

    // Simulate signing delay
    await new Promise(res => setTimeout(res, 1500));
    setProgress(33);
    setMockTxStatus('relaying');
    setMockTxMessage('Sending signed message to relayer...');

    // Simulate relaying delay
    await new Promise(res => setTimeout(res, 2000));
    setProgress(66);
    setMockTxStatus('executing'); // Added intermediate state
    setMockTxMessage('Relayer submitting transaction on-chain...');

    // Simulate execution delay
    await new Promise(res => setTimeout(res, 2500));
    setProgress(100);
    setMockTxStatus('confirmed');
    setMockTokenBalance(prev => prev - amountToSend);
    setMockRecipient(''); // Clear inputs after success
    setMockAmount('');
    setMockTxMessage(`Successfully transferred ${amountToSend} ${mockChallenge.tokenSymbol} gaslessly (mock)!`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  // --- Lab Steps Definition ---
  const labStepsContent = [
    {
      id: 0,
      label: 'Introduction & Concepts',
      icon: <School />,
      content: (
        <Box>
          <Typography variant="h5" gutterBottom>Welcome to the Gasless Transactions Lab!</Typography>
          <Typography paragraph>
            In traditional blockchain interactions, users must hold the network's native token (like ETH) to pay for 'gas' - the fee required to execute transactions. This can be a hurdle for new users.
          </Typography>
          <Typography variant="h6" gutterBottom>What are Meta-Transactions?</Typography>
          <Typography paragraph>
            Meta-transactions, often called "gasless" transactions from the user's perspective, solve this. The user signs a message containing their desired action (e.g., "transfer 10 tokens to Bob") using their private key *off-chain*. This signed message is then sent to a trusted third-party service called a **Relayer**.
          </Typography>
          <Typography paragraph>
            The Relayer takes the signed message, wraps it in an actual blockchain transaction, pays the necessary gas fees, and submits it to the network. A special smart contract (often called a **Forwarder** or **Trusted Forwarder**) receives this transaction.
          </Typography>
           <Typography variant="h6" gutterBottom>How it Works On-Chain</Typography>
          <Typography paragraph>
            The Forwarder contract verifies two crucial things:
            <ol>
              <li>Is the signature on the message valid and does it come from the user specified in the message?</li>
              <li>Has this specific message (often checked using a 'nonce' or counter) already been processed? (Replay Protection)</li>
            </ol>
            If both checks pass, the Forwarder contract executes the action requested in the message *on behalf of the user*. The user never sent an on-chain transaction themselves!
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Key Takeaway</AlertTitle>
            The user signs data, the relayer pays gas and submits the transaction, and a smart contract verifies the signature and executes the intended action.
          </Alert>

          {/* --- Quiz for Step 0 --- */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Concept Check</Typography>
          {(quizQuestions[0] || []).map((q, index) => (
            <Box key={q.id} sx={{ mb: 2 }}>
              <FormControl component="fieldset" error={quizSubmitted[0] && quizAnswers[`0-${q.id}`] !== q.correctAnswer.toString()} fullWidth>
                <FormLabel component="legend">{index + 1}. {q.question}</FormLabel>
                <RadioGroup
                  value={quizAnswers[`0-${q.id}`] || ''}
                  onChange={(e) => handleQuizAnswerChange(0, q.id, e.target.value)}
                >
                  {q.options.map((option, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={idx.toString()}
                      control={<Radio disabled={quizPassed[0]}/>}
                      label={option}
                      disabled={quizPassed[0]}
                    />
                  ))}
                </RadioGroup>
                 {quizSubmitted[0] && quizAnswers[`0-${q.id}`] !== q.correctAnswer.toString() && !quizPassed[0] && (
                     <Typography variant="caption" color="error">Incorrect. Review the introduction.</Typography>
                 )}
              </FormControl>
            </Box>
          ))}
          {!quizPassed[0] && (
              <Button variant="contained" onClick={() => handleQuizSubmit(0)} disabled={!(quizAnswers['0-q1'] && quizAnswers['0-q2'])}>
                Check Answers
              </Button>
          )}
          {quizPassed[0] && <Alert severity="success">Concepts understood! You can proceed.</Alert>}
          {/* --- End Quiz --- */}

        </Box>
      )
    },
    {
        id: 1,
        label: 'EIP-712 Signatures',
        icon: <Fingerprint />,
        content: (
            <Box>
                <Typography variant="h5" gutterBottom>Signing Structured Data: EIP-712</Typography>
                <Typography paragraph>
                    Simply signing a random hash isn't very user-friendly. How does the user know what they are actually authorizing? EIP-712 solves this by defining a standard for signing **typed structured data**.
                </Typography>
                <Typography paragraph>
                    Instead of an unreadable hash, wallets supporting EIP-712 can show the user the actual data fields they are signing in a clear format (e.g., "Transfer 10 MGT from YourAddress to RecipientAddress with Nonce 5"). This significantly improves security and user trust.
                </Typography>
                 <Typography variant="h6" gutterBottom>Key Components</Typography>
                 <List dense>
                    <ListItem>
                        <ListItemIcon><Info fontSize="small"/></ListItemIcon>
                        <ListItemText primary="Domain Separator:" secondary="Unique identifier for the dApp/contract context (name, version, chain ID, verifying contract address) to prevent cross-application signature replay." />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><Info fontSize="small"/></ListItemIcon>
                        <ListItemText primary="Data Types:" secondary="Definition of the structure of the message being signed (e.g., types for 'from', 'to', 'amount', 'nonce')." />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><Info fontSize="small"/></ListItemIcon>
                        <ListItemText primary="Message Values:" secondary="The actual data corresponding to the defined types." />
                    </ListItem>
                 </List>
                <Typography variant="h6" gutterBottom sx={{mt: 2}}>Client-Side Signing Example</Typography>
                <Typography paragraph>
                    Here's how you might create an EIP-712 signature using ethers.js:
                </Typography>
                <CodeEditor
                    value={eip712ClientCode}
                    language="javascript"
                    readOnly
                    height="400px"
                />
                <Typography variant="h6" gutterBottom sx={{mt: 2}}>On-Chain Verification</Typography>
                 <Typography paragraph>
                    The Forwarder contract needs to reconstruct the same EIP-712 hash using the domain separator and message data, then use `ecrecover` to verify the signer matches the `from` address. Libraries like OpenZeppelin's `ECDSA.recover` simplify this.
                 </Typography>

                 {/* --- Quiz for Step 2 (EIP-712) --- */}
                 <Divider sx={{ my: 3 }} />
                 <Typography variant="h6" gutterBottom>Concept Check</Typography>
                 {(quizQuestions[2] || []).map((q, index) => (
                    <Box key={q.id} sx={{ mb: 2 }}>
                    {q.type === 'text' ? (
                         <TextField
                            fullWidth
                            label={`${index + 1}. ${q.question}`}
                            value={quizAnswers[`2-${q.id}`] || ''}
                            onChange={(e) => handleQuizAnswerChange(2, q.id, e.target.value)}
                            error={quizSubmitted[2] && !quizAnswers[`2-${q.id}`]?.toLowerCase().includes(q.correctAnswer.toLowerCase()) && !quizPassed[2]}
                            helperText={quizSubmitted[2] && !quizAnswers[`2-${q.id}`]?.toLowerCase().includes(q.correctAnswer.toLowerCase()) && !quizPassed[2] ? `Incorrect. Hint: ${q.correctAnswer}` : ' '}
                            disabled={quizPassed[2]}
                            variant="outlined"
                            margin="dense"
                        />
                    ) : (
                        <FormControl component="fieldset" error={quizSubmitted[2] && quizAnswers[`2-${q.id}`] !== q.correctAnswer.toString() && !quizPassed[2]} fullWidth>
                            <FormLabel component="legend">{index + 1}. {q.question}</FormLabel>
                            <RadioGroup
                            value={quizAnswers[`2-${q.id}`] || ''}
                            onChange={(e) => handleQuizAnswerChange(2, q.id, e.target.value)}
                            >
                            {q.options.map((option, idx) => (
                                <FormControlLabel
                                key={idx}
                                value={idx.toString()}
                                control={<Radio disabled={quizPassed[2]}/>}
                                label={option}
                                disabled={quizPassed[2]}
                                />
                            ))}
                            </RadioGroup>
                            {quizSubmitted[2] && quizAnswers[`2-${q.id}`] !== q.correctAnswer.toString() && !quizPassed[2] && (
                                <Typography variant="caption" color="error">Incorrect. Review EIP-712 benefits/components.</Typography>
                            )}
                        </FormControl>
                     )}
                    </Box>
                 ))}
                 {!quizPassed[2] && (
                    <Button variant="contained" onClick={() => handleQuizSubmit(2)} disabled={!(quizAnswers['2-q1'] && quizAnswers['2-q2'] && quizAnswers['2-q3'])}>
                        Check Answers
                    </Button>
                 )}
                 {quizPassed[2] && <Alert severity="success">EIP-712 concepts understood! Proceed.</Alert>}
                 {/* --- End Quiz --- */}
            </Box>
        )
    },
    {
        id: 2, // Adjusted ID to match array index
        label: 'Relayer Service',
        icon: <Construction />,
        content: (
            <Box>
                 <Typography variant="h5" gutterBottom>The Relayer: Bridging Off-Chain and On-Chain</Typography>
                 <Typography paragraph>
                    The relayer is a backend service (it doesn't have to be decentralized, but it can be) that listens for signed meta-transaction requests from users.
                 </Typography>
                 <Typography variant="h6" gutterBottom>Core Responsibilities</Typography>
                 <List dense>
                    <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText primary="Receive Signed Requests:" secondary="Accepts the EIP-712 signed message and parameters from the user." />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText primary="Validate (Optional but Recommended):" secondary="Can perform off-chain checks like signature verification and nonce validation to avoid wasting gas on invalid requests." />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText primary="Submit On-Chain Transaction:" secondary="Constructs and sends the actual transaction to the Forwarder contract's `execute` (or similar) function, including the user's data and signature." />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText primary="Pay Gas Fees:" secondary="Uses its own wallet (funded with native tokens like ETH) to cover the transaction costs." />
                    </ListItem>
                     <ListItem>
                        <ListItemIcon><CheckCircle fontSize="small" color="primary"/></ListItemIcon>
                        <ListItemText primary="Manage Nonces & Gas:" secondary="Handles potential network congestion, transaction retries, and gas price strategies." />
                    </ListItem>
                 </List>
                 <Typography variant="h6" gutterBottom sx={{mt: 2}}>Real-World Considerations</Typography>
                 <Typography paragraph>
                    In production, relayers need to be robust. They might handle thousands of requests. Considerations include:
                    <ul>
                        <li><strong>Scalability:</strong> Handling concurrent requests.</li>
                        <li><strong>Reliability:</strong> Ensuring transactions eventually get mined (retries, gas bumping).</li>
                        <li><strong>Security:</strong> Protecting the relayer's private key, preventing DoS attacks.</li>
                        <li><strong>Monitoring:</strong> Tracking transaction statuses and relayer funds.</li>
                        <li><strong>Cost Management:</strong> Optimizing gas usage, potentially charging fees or being subsidized by the dApp.</li>
                    </ul>
                 </Typography>
                 <Typography variant="h6" gutterBottom sx={{mt: 2}}>Example Relayer Endpoint</Typography>
                 <Typography paragraph>
                    This simplified Node.js/Express example shows the basic structure of a relayer endpoint.
                 </Typography>
                 <CodeEditor
                    value={relayerServerCode}
                    language="javascript"
                    readOnly
                    height="400px"
                />

                 {/* --- Quiz for Step 3 (Relayer) --- */}
                 <Divider sx={{ my: 3 }} />
                 <Typography variant="h6" gutterBottom>Concept Check</Typography>
                 {(quizQuestions[3] || []).map((q, index) => (
                    <Box key={q.id} sx={{ mb: 2 }}>
                        <FormControl component="fieldset" error={quizSubmitted[3] && quizAnswers[`3-${q.id}`] !== q.correctAnswer.toString() && !quizPassed[3]} fullWidth>
                            <FormLabel component="legend">{index + 1}. {q.question}</FormLabel>
                            <RadioGroup
                            value={quizAnswers[`3-${q.id}`] || ''}
                            onChange={(e) => handleQuizAnswerChange(3, q.id, e.target.value)}
                            >
                            {q.options.map((option, idx) => (
                                <FormControlLabel
                                key={idx}
                                value={idx.toString()}
                                control={<Radio disabled={quizPassed[3]}/>}
                                label={option}
                                disabled={quizPassed[3]}
                                />
                            ))}
                            </RadioGroup>
                            {quizSubmitted[3] && quizAnswers[`3-${q.id}`] !== q.correctAnswer.toString() && !quizPassed[3] && (
                                <Typography variant="caption" color="error">Incorrect. Review relayer responsibilities/security.</Typography>
                            )}
                        </FormControl>
                    </Box>
                 ))}
                 {!quizPassed[3] && (
                    <Button variant="contained" onClick={() => handleQuizSubmit(3)} disabled={!(quizAnswers['3-q1'] && quizAnswers['3-q2'])}>
                        Check Answers
                    </Button>
                 )}
                 {quizPassed[3] && <Alert severity="success">Relayer concepts understood! Ready for the challenge.</Alert>}
                 {/* --- End Quiz --- */}
            </Box>
        )
    },
    {
      id: 3, // Adjusted ID
      label: 'Challenge: Mock Gasless Transfer',
      icon: <EmojiEvents />,
      content: (
        <Box>
            <Typography variant="h5" gutterBottom>The Challenge: Simulate a Gasless Transfer</Typography>
            <Typography paragraph>
                Your goal is to use the concepts learned to simulate sending a gasless ERC20 token transfer.
                We will **mock** the process without real blockchain interaction for now.
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Mock Scenario</AlertTitle>
                Imagine a user wants to send some `{mockChallenge.tokenSymbol}` tokens they own to a friend, but they have no ETH for gas. They will sign a message, and we'll simulate a relayer processing it.
            </Alert>

            {/* --- Mock UI --- */}
            <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Mock Wallet & Token</Typography>
                 <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1">Your Address:</Typography>
                        <Chip label={mockChallenge.userAddress} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <Typography variant="body1">Your {mockChallenge.tokenSymbol} Balance:</Typography>
                         <Chip
                            icon={<AccountBalanceWallet />}
                            label={mockTokenBalance}
                            color="primary"
                            variant="outlined"
                         />
                         <Button
                            size="small"
                            startIcon={<AddCircleOutline />}
                            onClick={handleMintMockTokens}
                            sx={{ ml: 1 }}
                         >
                            Mint Mock Tokens
                         </Button>
                    </Grid>
                 </Grid>

                 <Divider sx={{ my: 3 }} />

                 <Typography variant="h6" gutterBottom>Initiate Mock Gasless Transfer</Typography>
                 <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Recipient Address"
                            variant="outlined"
                            value={mockRecipient}
                            onChange={(e) => setMockRecipient(e.target.value)}
                            size="small"
                            placeholder="0xRecipient..."
                        />
                    </Grid>
                     <Grid item xs={12} sm={4}>
                         <TextField
                            fullWidth
                            label="Amount to Send"
                            variant="outlined"
                            type="number"
                            value={mockAmount}
                            onChange={(e) => setMockAmount(e.target.value)}
                            size="small"
                            InputProps={{ inputProps: { min: 0 } }}
                         />
                    </Grid>
                     <Grid item xs={12} sm={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleMockTransfer}
                            disabled={mockTxStatus !== 'idle' && mockTxStatus !== 'confirmed' && mockTxStatus !== 'failed'} // Disable during process
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <Send />}
                        >
                            Send
                        </Button>
                    </Grid>
                 </Grid>

                 {/* --- Mock Transaction Progress --- */}
                 {(mockTxStatus !== 'idle' && mockTxStatus !== '') && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Transaction Status: {mockTxMessage}</Typography>
                        <LinearProgress variant="determinate" value={progress} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Chip icon={<Fingerprint />} label="Sign" size="small" color={progress >= 0 ? 'primary' : 'default'} variant={progress >= 0 ? 'filled' : 'outlined'}/>
                            <Chip icon={<PublishedWithChanges />} label="Relay" size="small" color={progress >= 33 ? 'primary' : 'default'} variant={progress >= 33 ? 'filled' : 'outlined'}/>
                            <Chip icon={<Terminal />} label="Execute" size="small" color={progress >= 66 ? 'primary' : 'default'} variant={progress >= 66 ? 'filled' : 'outlined'}/>
                            <Chip icon={<ReceiptLong />} label="Confirm" size="small" color={progress >= 100 ? 'success' : 'default'} variant={progress >= 100 ? 'filled' : 'outlined'}/>
                        </Box>
                    </Box>
                 )}
            </Paper>
             {/* --- End Mock UI --- */}

             <Divider sx={{ my: 3 }} />

             <Typography variant="h6" gutterBottom>Challenge Details</Typography>
             <Typography paragraph>
                In a real scenario (which you might implement later), you would:
             </Typography>
             <List dense>
                <li>Connect a real wallet (e.g., MetaMask).</li>
                <li>Use the connected signer with the `signGaslessTransfer` function (from the EIP-712 step).</li>
                <li>Send the resulting signed request to a *real* relayer endpoint.</li>
                <li>The relayer would call the `execute` function on the deployed Forwarder contract.</li>
                <li>Verify the token balance change on a block explorer.</li>
             </List>
             <Typography variant="subtitle1" gutterBottom>Forwarder Contract Info (Example)</Typography>
              <Typography variant="body2">Address: {mockChallenge.forwarderAddress}</Typography>
              <Typography variant="body2" sx={{mt: 1}}>Relevant ABI Snippet:</Typography>
              <CodeEditor
                    value={mockChallenge.abiSnippet}
                    language="json"
                    readOnly
                    height="250px"
                />
             <Alert severity="success" sx={{ mt: 3 }}>
                <AlertTitle>Lab Complete!</AlertTitle>
                You've explored the concepts behind gasless transactions, EIP-712 signatures, relayers, and simulated the core flow. You're now ready to implement this in a real dApp!
             </Alert>
        </Box>
      )
    },
  ];


  // --- Render Logic ---

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalGasStation sx={{ mr: 1, fontSize: '2.5rem' }} /> Gasless Forwarder Lab
          </Typography>
          {/* Add completion status chip if needed */}
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Learn and simulate gasless transactions using meta-transactions and relayers.
        </Typography>
      </Paper>

      {/* Stepper and Content */}
      <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {labStepsContent.map((step, index) => (
            <Step key={step.id} expanded={true}>
              <StepLabel
                icon={step.icon || <Info />} // Default icon
                optional={
                  quizQuestions[step.id] ? (
                    quizPassed[step.id] ? (
                      <Chip icon={<CheckCircle />} label="Quiz Passed" size="small" color="success" variant="outlined" />
                    ) : quizSubmitted[step.id] ? (
                       <Chip label="Quiz Failed" size="small" color="warning" variant="outlined" />
                    ): (
                       <Chip label="Quiz Pending" size="small" variant="outlined" />
                    )
                  ) : null // No quiz for this step
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2, pl: { xs: 1, sm: 2 }, borderLeft: '1px solid lightgrey' }}>
                  {/* Render step content */}
                  {step.content}

                  {/* Navigation Buttons */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid lightgrey' }}>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                      startIcon={<ArrowBack />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={index === labStepsContent.length - 1 || (quizQuestions[step.id] && !quizPassed[step.id])} // Disable if quiz exists and not passed
                      endIcon={<ArrowForward />}
                    >
                      {index === labStepsContent.length - 1 ? 'Finish Lab' : 'Next Step'}
                    </Button>
                     {quizQuestions[step.id] && !quizPassed[step.id] && (
                        <Typography variant="caption" color="textSecondary" sx={{ml: 2}}>
                            Complete the quiz to proceed.
                        </Typography>
                     )}
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

         {/* Completion Message at the end */}
         {activeStep === labStepsContent.length && (
             <Box sx={{ p: 3, mt: 2, textAlign: 'center' }}>
                 <Typography variant="h5" gutterBottom>Lab Completed!</Typography>
                 <CheckCircle color="success" sx={{ fontSize: 60, my: 2 }} />
                 <Typography paragraph>
                     You have successfully explored the concepts and simulated a gasless transaction.
                 </Typography>
                 <Button
                     variant="contained"
                     onClick={() => navigate('/labs')} // Navigate back to labs list or dashboard
                     sx={{ mt: 1 }}
                 >
                     Back to Labs Overview
                 </Button>
             </Box>
         )}
      </Paper>

       {/* Snackbar for mock transaction feedback */}
       <Snackbar
         open={snackbarOpen}
         autoHideDuration={4000} // Hide after 4 seconds
         onClose={handleSnackbarClose}
         message={mockTxMessage}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
       />
    </Box>
  );
};

export default GaslessForwarderLab;