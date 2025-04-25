// src/pages/ScriptFundamentals.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Divider,
    Card,
    CardContent,
    Grid,
    TextField,
    Alert,
    AlertTitle, // Added missing import
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Chip
} from '@mui/material';
import {
    ArrowForward,
    Check,
    Code,
    Warning,
    CheckCircle,
    Error
} from '@mui/icons-material';

import CodeEditor from '../components/game/CodeEditor'; // Assuming this component exists

const ScriptFundamentals = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    // Exercise state for function declarations
    const [functionExercises, setFunctionExercises] = useState({
        ex1: '',
        ex2: '',
        ex3: '',
        ex4: '',
        ex5: ''
    });

    const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
    const [exerciseResults, setExerciseResults] = useState({
        passed: false,
        score: 0,
        feedback: '',
        errors: {}
    });

    // Quiz state
    const [quizAnswers, setQuizAnswers] = useState({
        q1: '',
        q2: '',
        q3: '',
        q4: ''
    });

    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResults, setQuizResults] = useState({
        passed: false,
        score: 0,
        feedback: ''
    });

    // Code editor state
    const [codeInput, setCodeInput] = useState(
        `// Example: A simple script to interact with a blockchain contract
const { ethers } = require("ethers");

async function main() {
  // Connect to the blockchain (e.g., via Infura, Alchemy, or local node)
  const provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL");

  // Create a wallet instance (for signing transactions)
  const privateKey = "YOUR_PRIVATE_KEY"; // Keep this secure!
  const wallet = new ethers.Wallet(privateKey, provider);

  // Contract details
  const contractAddress = "0x123..."; // The deployed contract address
  const contractAbi = [ /* Contract ABI goes here */];

  // Create contract instance
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  // Call a read-only function on the contract
  const result = await contract.someFunction();
  console.log("Result:", result);

  // Call a function that modifies state (requires transaction)
  const tx = await contract.someStateChangingFunction(param1, param2);
  console.log("Transaction hash:", tx.hash);

  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt.blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`
    );

    const handleFunctionExerciseChange = (exercise, value) => {
        setFunctionExercises({
            ...functionExercises,
            [exercise]: value
        });
    };

    const handleQuizChange = (question, value) => {
        setQuizAnswers({
            ...quizAnswers,
            [question]: value
        });
    };

    const handleFunctionExerciseSubmit = () => {
        // Check answers based on expected function syntax patterns
        const correctPatterns = {
            ex1: /function\s+\w+\s*\(\s*\)\s*\{/i,
            ex2: /const\s+\w+\s*=\s*function\s*\(\s*\)\s*\{/i,
            ex3: /const\s+\w+\s*=\s*\(\s*\)\s*=>\s*(\{|[^{])/i,
            ex4: /async\s+function\s+\w+\s*\(\s*\)\s*\{/i,
            ex5: /const\s+\w+\s*=\s*async\s*\(\s*\)\s*=>\s*(\{|[^{])/i
        };

        let score = 0;
        const errors = {};

        // Check each exercise answer
        Object.keys(correctPatterns).forEach(ex => {
            if (correctPatterns[ex].test(functionExercises[ex])) {
                score++;
            } else {
                errors[ex] = 'Incorrect function declaration syntax';
            }
        });

        const passed = score >= 4; // Pass with 4 or more correct

        setExerciseResults({
            passed,
            score,
            feedback: passed
                ? "Great job! You understand function declarations."
                : "Let's review function declarations a bit more.",
            errors
        });

        setExerciseSubmitted(true);
    };

    const handleQuizSubmit = () => {
        const correctAnswers = {
            q1: "b", // ethers.Contract
            q2: "c", // Promise
            q3: "a", // await
            q4: "b"  // provider.getSigner()
        };

        let score = 0;
        Object.keys(correctAnswers).forEach(question => {
            if (quizAnswers[question] === correctAnswers[question]) {
                score++;
            }
        });

        const passed = score >= 3; // Pass with 3 or more correct

        setQuizResults({
            passed,
            score,
            feedback: passed
                ? "Excellent! You understand the basics of blockchain scripting."
                : "Let's review blockchain scripting concepts a bit more."
        });

        setQuizSubmitted(true);
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleComplete = () => {
        navigate('/remote-execution'); // Ensure this route exists in your router setup
    };

    const scriptingSteps = [
        {
            label: 'JavaScript Functions for Blockchain',
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        JavaScript is the most common language used to interact with blockchain networks
                        through libraries like Ethers.js or Web3.js. Understanding function declarations
                        is essential for scripting blockchain interactions.
                    </Typography>

                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Function Declaration Types in JavaScript
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>
                                1. Standard Function Declaration
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                                    function functionName(parameter1, parameter2) {'{'}<br />
                                    &nbsp;&nbsp;// function body<br />
                                    &nbsp;&nbsp;return result;<br />
                                    {'}'}
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                2. Function Expression
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                                    const functionName = function(parameter1, parameter2) {'{'}<br />
                                    &nbsp;&nbsp;// function body<br />
                                    &nbsp;&nbsp;return result;<br />
                                    {'}'}
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                3. Arrow Function
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                                    const functionName = (parameter1, parameter2) =&gt; {'{'}<br />
                                    &nbsp;&nbsp;// function body<br />
                                    &nbsp;&nbsp;return result;<br />
                                    {'}'}<br /><br />
                  // Single-line arrow function with implicit return<br />
                                    const add = (a, b) =&gt; a + b;
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                4. Async Function Declaration
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                                    async function functionName(parameter1, parameter2) {'{'}<br />
                                    &nbsp;&nbsp;// function body with await<br />
                                    &nbsp;&nbsp;const result = await somePromise();<br />
                                    &nbsp;&nbsp;return result;<br />
                                    {'}'}
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                5. Async Arrow Function
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                                    const functionName = async (parameter1, parameter2) =&gt; {'{'}<br />
                                    &nbsp;&nbsp;// function body with await<br />
                                    &nbsp;&nbsp;const result = await somePromise();<br />
                                    &nbsp;&nbsp;return result;<br />
                                    {'}'}
                                </code>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="h6" gutterBottom>
                        Practice Exercise: Function Declarations
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Write the correct syntax for each type of function declaration:
                    </Typography>

                    {exerciseSubmitted ? (
                        <Box sx={{ mb: 3 }}>
                            <Alert severity={exerciseResults.passed ? "success" : "warning"}>
                                {exerciseResults.feedback} You got {exerciseResults.score}/5 correct.
                            </Alert>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setExerciseSubmitted(false);
                                    // Optionally reset errors if desired
                                    // setExerciseResults({ ...exerciseResults, errors: {} });
                                }}
                                sx={{ mt: 2 }}
                            >
                                Try Again
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" noValidate autoComplete="off" sx={{ mb: 3 }}>
                            <Grid container spacing={2}> {/* Changed spacing to 2 for better fit */}
                                <Grid item xs={12}>
                                    <TextField
                                        style={{ width: '500px' }} // Ensures full width
                                        fullWidth
                                        label="1. Standard function declaration named 'connectToBlockchain'"
                                        value={functionExercises.ex1}
                                        onChange={(e) => handleFunctionExerciseChange('ex1', e.target.value)}
                                        variant="outlined"
                                        margin="dense" // Changed margin
                                        error={!!exerciseResults.errors?.ex1 && exerciseSubmitted} // Show error only after submit
                                        helperText={exerciseSubmitted && exerciseResults.errors?.ex1}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        style={{ width: '500px' }}
                                        fullWidth
                                        label="2. Function expression named 'getContractInstance'"
                                        value={functionExercises.ex2}
                                        onChange={(e) => handleFunctionExerciseChange('ex2', e.target.value)}
                                        variant="outlined"
                                        margin="dense"
                                        error={!!exerciseResults.errors?.ex2 && exerciseSubmitted}
                                        helperText={exerciseSubmitted && exerciseResults.errors?.ex2}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        style={{ width: '500px' }}
                                        fullWidth
                                        label="3. Arrow function named 'formatAddress'"
                                        value={functionExercises.ex3}
                                        onChange={(e) => handleFunctionExerciseChange('ex3', e.target.value)}
                                        variant="outlined"
                                        margin="dense"
                                        error={!!exerciseResults.errors?.ex3 && exerciseSubmitted}
                                        helperText={exerciseSubmitted && exerciseResults.errors?.ex3}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        style={{ width: '500px' }}
                                        fullWidth
                                        label="4. Async function declaration named 'fetchBlockData'"
                                        value={functionExercises.ex4}
                                        onChange={(e) => handleFunctionExerciseChange('ex4', e.target.value)}
                                        variant="outlined"
                                        margin="dense"
                                        error={!!exerciseResults.errors?.ex4 && exerciseSubmitted}
                                        helperText={exerciseSubmitted && exerciseResults.errors?.ex4}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        style={{ width: '500px' }}
                                        fullWidth
                                        label="5. Async arrow function named 'submitTransaction'"
                                        value={functionExercises.ex5}
                                        onChange={(e) => handleFunctionExerciseChange('ex5', e.target.value)}
                                        variant="outlined"
                                        margin="dense"
                                        error={!!exerciseResults.errors?.ex5 && exerciseSubmitted}
                                        helperText={exerciseSubmitted && exerciseResults.errors?.ex5}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleFunctionExerciseSubmit}
                                sx={{ mt: 2 }}
                            >
                                Submit Answers
                            </Button>
                        </Box>
                    )}
                </Box>
            ),
        },
        {
            label: 'Ethers.js Basics',
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        Ethers.js is a powerful, compact library for interacting with the Ethereum blockchain
                        and its ecosystem. It's designed to be a complete and compact library for interacting
                        with the Ethereum Blockchain and its ecosystem.
                    </Typography>

                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Key Components of Ethers.js
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Providers
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        A Provider is your connection to the blockchain. It allows you to query blockchain data and state.
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                      // Connect to a JSON-RPC provider<br />
                                            const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_API_KEY");<br /><br />
                      // Or connect via a browser wallet like MetaMask<br />
                                            const provider = new ethers.providers.Web3Provider(window.ethereum);
                                        </code>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Signers
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        A Signer can sign transactions and messages. It's necessary for sending transactions that modify blockchain state.
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                      // Create a signer with a private key<br />
                                            const wallet = new ethers.Wallet(privateKey, provider);<br /><br />
                      // Or get a signer from a provider<br />
                                            const signer = provider.getSigner();
                                        </code>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Contracts
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        Contract objects represent smart contracts deployed on the blockchain and allow you to call their functions.
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                      // Create a contract instance<br />
                                            const contract = new ethers.Contract(<br />
                                            &nbsp;&nbsp;contractAddress, // The address of the deployed contract<br />
                                            &nbsp;&nbsp;contractAbi,     // The contract's ABI (interface)<br />
                                            &nbsp;&nbsp;signer           // A signer or provider<br />
                                            );
                                        </code>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Utils
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        Utility functions for formatting, parsing, and manipulating blockchain data.
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                      // Format wei to ether<br />
                                            const etherValue = ethers.utils.formatEther(weiValue);<br /><br />
                      // Parse ether to wei<br />
                                            const weiValue = ethers.utils.parseEther("1.0");<br /><br />
                      // Create a keccak256 hash<br />
                                            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("some data")); {/* Corrected keccak usage */}
                                        </code>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Common Patterns in Blockchain Scripts
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>
                                1. Setting Up a Connection
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                                    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);<br />
                                    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);<br />
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                2. Reading Contract State
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                  // Calling a view/pure function (doesn't change state)<br />
                                    const value = await contract.someViewFunction();<br />
                                    console.log("Value:", value.toString()); // Convert BigNumber to string if needed
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                3. Modifying Contract State
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                  // Sending a transaction that changes state<br />
                                    const tx = await contract.someStateChangingFunction(param1, param2);<br />
                                    console.log("Transaction sent:", tx.hash);<br /><br />
                  // Wait for transaction to be mined<br />
                                    const receipt = await tx.wait();<br />
                                    console.log("Transaction confirmed in block:", receipt.blockNumber);
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                4. Listening for Events
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                <code>
                  // Listen for an event<br />
                                    contract.on("EventName", (param1, param2, event) =&gt; {'{'}<br />
                                    &nbsp;&nbsp;console.log("Event occurred:", param1, param2);<br />
                                    &nbsp;&nbsp;// The event object contains transaction data<br />
                                    &nbsp;&nbsp;console.log("Transaction hash:", event.transactionHash);<br />
                                    {'}'});
                                </code>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography variant="h6" gutterBottom>
                        Sample Script & Explanation
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7}>
                            {/* Assuming CodeEditor component handles its props correctly */}
                            <CodeEditor
                                value={codeInput}
                                language="javascript"
                                height="400px"
                                onChange={(value) => setCodeInput(value || '')} // Ensure onChange provides a value
                            />
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Script Breakdown
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        This script demonstrates a standard pattern for interacting with an Ethereum smart contract:
                                    </Typography>
                                    <ol>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Import ethers.js library</strong> to access blockchain interaction tools
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Create a provider</strong> to connect to the blockchain network
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Create a wallet instance</strong> with a private key for transaction signing
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Initialize a contract instance</strong> with its address and ABI
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Read data</strong> from the contract with a view function call
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Send a transaction</strong> to modify contract state
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="body2">
                                                <strong>Wait for confirmation</strong> and process the result
                                            </Typography>
                                        </li>
                                    </ol>
                                    <Typography variant="body2" paragraph>
                                        <strong>Note:</strong> Always use environment variables or secure methods to store private keys,
                                        never hardcode them in your scripts!
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            ),
        },
        {
            label: 'Async Programming in Blockchain',
            content: (
                <Box>
                    <Typography variant="body1" paragraph>
                        Blockchain interactions are inherently asynchronous because they involve network requests
                        to nodes that may take time to process. Understanding async programming is crucial for
                        effective blockchain scripting.
                    </Typography>

                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Promises & Async/Await in Blockchain Scripts
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom>
                                Promises
                            </Typography>
                            <Typography variant="body2" paragraph>
                                A Promise is an object representing the eventual completion or failure of an asynchronous operation.
                                All Ethers.js functions that interact with the blockchain return Promises.
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                                <code>
                  // Using Promises with .then() and .catch()<br />
                                    contract.someFunction()<br />
                                    &nbsp;&nbsp;.then(result =&gt; {'{'}<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;console.log("Success:", result);<br />
                                    &nbsp;&nbsp;{'}'})<br />
                                    &nbsp;&nbsp;.catch(error =&gt; {'{'}<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;console.error("Error:", error);<br />
                                    &nbsp;&nbsp;{'}'});
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                Async/Await
                            </Typography>
                            <Typography variant="body2" paragraph>
                                Async/await is a more modern, cleaner syntax for working with Promises. It makes
                                asynchronous code look and behave more like synchronous code.
                            </Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                                <code>
                  // Using async/await<br />
                                    async function callContract() {'{'}<br />
                                    &nbsp;&nbsp;try {'{'}<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;const result = await contract.someFunction();<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;console.log("Success:", result);<br />
                                    &nbsp;&nbsp;{'}'} catch (error) {'{'}<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;console.error("Error:", error);<br />
                                    &nbsp;&nbsp;{'}'}<br />
                                    {'}'}
                                </code>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                Why Async/Await is Important for Blockchain
                            </Typography>
                            <ul>
                                <li>
                                    <Typography variant="body2">
                                        <strong>Sequential Operations:</strong> Many blockchain operations need to happen in sequence
                                        (e.g., deploy contract, then call a function on it)
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body2">
                                        <strong>Transaction Confirmations:</strong> After sending a transaction, you often need to wait
                                        for it to be confirmed before proceeding
                                    </Typography>
                                </li>
                                <li>
                                    <Typography variant="body2">
                                        <strong>Error Handling:</strong> Blockchain operations can fail for many reasons (out of gas,
                                        reverted transactions, network issues), and proper error handling is essential
                                    </Typography>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Common Async Patterns in Blockchain Scripts
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        1. Waiting for Transaction Confirmation
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                                            async function sendAndConfirm() {'{'}<br />
                                            &nbsp;&nbsp;// Send transaction<br />
                                            &nbsp;&nbsp;const tx = await contract.someFunction();<br />
                                            &nbsp;&nbsp;console.log("Sent tx:", tx.hash);<br /><br />
                                            &nbsp;&nbsp;// Wait for confirmation (1 block)<br />
                                            &nbsp;&nbsp;const receipt = await tx.wait();<br />
                                            &nbsp;&nbsp;console.log("Confirmed in block:", receipt.blockNumber);<br />
                                            {'}'}
                                        </code>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        2. Handling Multiple Promises
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                                            async function getMultipleValues() {'{'}<br />
                                            &nbsp;&nbsp;// Run promises in parallel with Promise.all<br />
                                            &nbsp;&nbsp;const [balance, supply, name] = await Promise.all([<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;contract.balanceOf(address),<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;contract.totalSupply(),<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;contract.name()<br />
                                            &nbsp;&nbsp;]);<br /><br />
                                            &nbsp;&nbsp;console.log("Balance:", balance.toString());<br />
                                            &nbsp;&nbsp;console.log("Total Supply:", supply.toString());<br />
                                            &nbsp;&nbsp;console.log("Name:", name);<br />
                                            {'}'}
                                        </code>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        3. Retrying Failed Transactions
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                                            async function retryTransaction(maxAttempts = 3) {'{'}<br />
                                            &nbsp;&nbsp;let attempts = 0;<br />
                                            &nbsp;&nbsp;while (attempts &lt; maxAttempts) {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;try {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const tx = await contract.someFunction();<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const receipt = await tx.wait();<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return receipt; // Success!<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;{'}'} catch (error) {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;attempts++;<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log(`Attempt $ attempts failed`); // Fixed template literal
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if (attempts &gt;= maxAttempts) {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.error("Max attempts reached. Error:", error);<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;throw new Error("All attempts failed");<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'}'} else {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await new Promise(res =&gt; setTimeout(res, 1000 * attempts)); // Optional backoff
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br />
                                            &nbsp;&nbsp;{'}'}<br />
                                            {'}'}
                                        </code>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        4. Event Listening with Promises
                                    </Typography>
                                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                                        <code>
                                            function waitForEvent(eventName) {'{'}<br />
                                            &nbsp;&nbsp;return new Promise((resolve, reject) =&gt; {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;// Set timeout to prevent infinite waiting<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;const timeout = setTimeout(() =&gt; {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;contract.removeAllListeners(eventName);<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;reject(new Error("Timeout waiting for event"));<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}, 60000); // 1 minute timeout<br /><br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;// Listen for the event<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;contract.once(eventName, (...args) =&gt; {'{'}<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;clearTimeout(timeout);<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;resolve(args);<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;{'}'});<br />
                                            &nbsp;&nbsp;{'}'});<br />
                                            {'}'}
                                        </code>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Typography variant="h6" gutterBottom>
                        Knowledge Check Quiz
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Test your understanding of blockchain scripting concepts:
                    </Typography>

                    {quizSubmitted ? (
                        <Box sx={{ mb: 3 }}>
                            <Alert severity={quizResults.passed ? "success" : "warning"}>
                                {quizResults.feedback} You got {quizResults.score}/4 correct.
                            </Alert>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setQuizSubmitted(false);
                                    setQuizAnswers({ q1: '', q2: '', q3: '', q4: '' });
                                }}
                                sx={{ mt: 2 }}
                            >
                                Retry Quiz
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" noValidate autoComplete="off" sx={{ mb: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">1. Which ethers.js object is used to interact with a deployed smart contract?</FormLabel>
                                        <RadioGroup
                                            value={quizAnswers.q1}
                                            onChange={(e) => handleQuizChange('q1', e.target.value)}
                                        >
                                            <FormControlLabel value="a" control={<Radio />} label="ethers.Blockchain" />
                                            <FormControlLabel value="b" control={<Radio />} label="ethers.Contract" />
                                            <FormControlLabel value="c" control={<Radio />} label="ethers.SmartContract" />
                                            <FormControlLabel value="d" control={<Radio />} label="ethers.Application" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">2. What do blockchain API calls return in JavaScript?</FormLabel>
                                        <RadioGroup
                                            value={quizAnswers.q2}
                                            onChange={(e) => handleQuizChange('q2', e.target.value)}
                                        >
                                            <FormControlLabel value="a" control={<Radio />} label="Callbacks" />
                                            <FormControlLabel value="b" control={<Radio />} label="Observables" />
                                            <FormControlLabel value="c" control={<Radio />} label="Promises" />
                                            <FormControlLabel value="d" control={<Radio />} label="Iterators" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">3. Which keyword is used to pause execution until a Promise resolves?</FormLabel>
                                        <RadioGroup
                                            value={quizAnswers.q3}
                                            onChange={(e) => handleQuizChange('q3', e.target.value)}
                                        >
                                            <FormControlLabel value="a" control={<Radio />} label="await" />
                                            <FormControlLabel value="b" control={<Radio />} label="yield" />
                                            <FormControlLabel value="c" control={<Radio />} label="resolve" />
                                            <FormControlLabel value="d" control={<Radio />} label="then" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">4. How do you get a signer object from a provider when using a browser wallet?</FormLabel>
                                        <RadioGroup
                                            value={quizAnswers.q4}
                                            onChange={(e) => handleQuizChange('q4', e.target.value)}
                                        >
                                            <FormControlLabel value="a" control={<Radio />} label="provider.createSigner()" />
                                            <FormControlLabel value="b" control={<Radio />} label="provider.getSigner()" />
                                            <FormControlLabel value="c" control={<Radio />} label="provider.signer()" />
                                            <FormControlLabel value="d" control={<Radio />} label="new ethers.Signer(provider)" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleQuizSubmit}
                                disabled={Object.values(quizAnswers).some(answer => !answer)}
                                sx={{ mt: 2 }}
                            >
                                Submit Quiz
                            </Button>
                        </Box>
                    )}
                </Box>
            ),
        },
        {
            label: 'Next Steps',
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        You're Ready for Remote Execution!
                    </Typography>

                    {quizResults.passed && exerciseResults.passed ? (
                        <Box>
                            <Alert severity="success" sx={{ mb: 3 }}>
                                <AlertTitle>Congratulations!</AlertTitle>
                                You've successfully completed the blockchain scripting fundamentals sections.
                                You now have the knowledge needed to interact with blockchain contracts using JavaScript.
                            </Alert>

                            <Typography variant="body1" paragraph>
                                In the next section, you'll learn how to:
                            </Typography>

                            <Box sx={{ pl: 2, mb: 3 }}>
                                <Typography component="ul"> {/* Use UL for list */}
                                    <li>Set up a development environment for blockchain interaction</li>
                                    <li>Connect your scripts to test networks</li>
                                    <li>Structure your code for interacting with the Blockchain Guardian contracts</li>
                                    <li>Execute remote scripts to solve the game challenges</li>
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleComplete}
                                endIcon={<ArrowForward />}
                                size="large"
                            >
                                Continue to Remote Execution Setup
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <AlertTitle>Almost There!</AlertTitle>
                                Before proceeding to the remote execution section, please complete both the function exercises and the knowledge check quiz.
                            </Alert>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6">Function Exercises</Typography>
                                                <Box sx={{ ml: 2 }}>
                                                    {exerciseResults.passed ? (
                                                        <Chip icon={<CheckCircle />} label="Completed" color="success" />
                                                    ) : (
                                                        <Chip icon={<Error />} label="Incomplete" color="warning" />
                                                    )}
                                                </Box>
                                            </Box>
                                            {!exerciseResults.passed && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => setActiveStep(0)}
                                                    sx={{ mt: 1 }}
                                                >
                                                    Go to Exercises
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6">Knowledge Check Quiz</Typography>
                                                <Box sx={{ ml: 2 }}>
                                                    {quizResults.passed ? (
                                                        <Chip icon={<CheckCircle />} label="Completed" color="success" />
                                                    ) : (
                                                        <Chip icon={<Error />} label="Incomplete" color="warning" />
                                                    )}
                                                </Box>
                                            </Box>
                                            {!quizResults.passed && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => setActiveStep(2)} // Step index is 0-based
                                                    sx={{ mt: 1 }}
                                                >
                                                    Go to Quiz
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Blockchain Scripting Fundamentals
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Learn how to write JavaScript functions for interacting with blockchain contracts
                </Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                    {scriptingSteps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                            <StepContent>
                                <Box sx={{ mb: 2 }}>
                                    {step.content}
                                    <Box sx={{ mt: 2 }}>
                                        <div>
                                            <Button
                                                variant="contained"
                                                // Logic simplified slightly: button handles next or completion
                                                onClick={index === scriptingSteps.length - 1 ? handleComplete : handleNext}
                                                sx={{ mt: 1, mr: 1 }}
                                                // Disable Finish button if prerequisites aren't met
                                                disabled={index === scriptingSteps.length - 1 && !(quizResults.passed && exerciseResults.passed)}
                                                endIcon={index === scriptingSteps.length - 1 ? <Check /> : <ArrowForward />}
                                            >
                                                {index === scriptingSteps.length - 1 ? 'Finish' : 'Continue'}
                                            </Button>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                sx={{ mt: 1, mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                        </div>
                                    </Box>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                {/* This section might be redundant if the last step's button handles completion */}
                {/* Consider removing if handleComplete is correctly triggered by the Finish button */}
                {activeStep === scriptingSteps.length && quizResults.passed && exerciseResults.passed && (
                    <Box sx={{ p: 3, mt: 2 }}>
                        <Typography gutterBottom>
                            All steps completed - you're ready to move on to Remote Execution!
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleComplete}
                            endIcon={<ArrowForward />}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            Continue to Remote Execution Setup
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ScriptFundamentals;
// Removed the extra closing brace from here