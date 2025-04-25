// src/pages/PremiumLabs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  LockOutlined,
  School,
  CheckCircleOutline,
  ExpandMore,
  ArrowForward,
  Paid,
  CompareArrows,
  SmartToy,
  Bolt,
  VerifiedUser,
  LocalAtm,
  AccountBalanceWallet,
  LocalGasStation,
} from '@mui/icons-material';

import { useWeb3 } from '../contexts/Web3Context'; // Assuming context exists

// Mock data for subscription plans
const subscriptionPlans = [
  {
    id: 'monthly',
    name: 'Monthly Access',
    price: '0.05 ETH',
    features: [
      'Access to all premium labs',
      'Gasless Transaction Forwarder',
      'Cross Chain Asset Transfer Bridge',
      'Monthly billing',
    ],
    recommended: false,
    duration: 30, // days
  },
  {
    id: 'quarterly',
    name: 'Quarterly Access',
    price: '0.12 ETH',
    features: [
      'Access to all premium labs',
      'Gasless Transaction Forwarder',
      'Cross Chain Asset Transfer Bridge',
      'Quarterly billing (20% savings)',
      'Priority support',
    ],
    recommended: true,
    duration: 90, // days
  },
  {
    id: 'yearly',
    name: 'Annual Access',
    price: '0.4 ETH',
    features: [
      'Access to all premium labs',
      'Gasless Transaction Forwarder',
      'Cross Chain Asset Transfer Bridge',
      'Annual billing (33% savings)',
      'Priority support',
      'Early access to new labs',
    ],
    recommended: false,
    duration: 365, // days
  },
];

// Mock data for premium labs
const premiumLabs = [
  {
    id: 'gasless-forwarder',
    title: 'Gasless Transaction Forwarder',
    description: 'Learn to build and implement gasless transactions using meta-transactions and EIP-712 signatures.',
    level: 'Advanced',
    estimatedTime: '3-4 hours',
    icon: <LocalGasStation fontSize="large" />,
    color: '#7e57c2',
    contractFiles: ['TestToken.sol', 'Token.sol', 'RelayerManager.sol'],
  },
  {
    id: 'cross-chain-bridge',
    title: 'Cross Chain Asset Transfer Bridge',
    description: 'Build a secure cross-chain bridge to transfer assets between Ethereum networks using relayers and merkle proofs.',
    level: 'Expert',
    estimatedTime: '5-6 hours',
    icon: <CompareArrows fontSize="large" />,
    color: '#42a5f5',
    contractFiles: ['BridgeAmoyV2.sol', 'BridgeSepoliaV2.sol', 'RelayerManager.sol'],
  },
];

const PremiumLabs = () => {
  const navigate = useNavigate();
  const { isConnected, account, chainId } = useWeb3();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [showLabDetails, setShowLabDetails] = useState(null);
  
  // For demo purposes, check if user has subscription
  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);
      try {
        if (isConnected) {
          // Simulate API call to check subscription status
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // For demo: not subscribed by default
          setIsSubscribed(false);
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
        setError("Failed to check subscription status. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [isConnected, account]);

  const handleOpenSubscriptionDialog = (planId) => {
    setSelectedPlan(subscriptionPlans.find(plan => plan.id === planId));
    setShowSubscriptionDialog(true);
  };

  const handleCloseSubscriptionDialog = () => {
    setShowSubscriptionDialog(false);
  };

  const handlePurchaseSubscription = async () => {
    if (!selectedPlan) return;
    
    setPurchaseLoading(true);
    try {
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setIsSubscribed(true);
      setShowSubscriptionDialog(false);
      
      // Show success message or redirect
    } catch (err) {
      console.error("Purchase error:", err);
      setError("Transaction failed. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleShowLabDetails = (labId) => {
    setShowLabDetails(labId);
  };

  const handleCloseLabDetails = () => {
    setShowLabDetails(null);
  };

  const handleStartLab = (labId) => {
    // Redirect to the specific lab page
    navigate(`/premium-lab/${labId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: isSubscribed ? 'success.light' : 'default' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <Typography variant="h4" component="h1" gutterBottom>
              Premium Labs
            </Typography>
            <Typography variant="body1" paragraph>
              Access advanced blockchain development content with our premium labs. 
              Dive deeper into complex blockchain patterns and architectures used in production environments.
            </Typography>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            {isSubscribed ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutline color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" color="success.dark">
                  Active Subscription
                </Typography>
              </Box>
            ) : (
              <Chip 
                icon={<LockOutlined />} 
                label="Subscription Required" 
                color="warning" 
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Area */}
      <Grid container spacing={4}>
        {/* Subscription Plans Section - Show only if not subscribed */}
        {!isSubscribed && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                <Paid sx={{ mr: 1, verticalAlign: 'middle' }} />
                Subscription Plans
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                {subscriptionPlans.map((plan) => (
                  <Grid item xs={12} md={4} key={plan.id}>
                    <Card 
                      raised={plan.recommended}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        border: plan.recommended ? 2 : 0,
                        borderColor: 'primary.main',
                        position: 'relative',
                      }}
                    >
                      {plan.recommended && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderTopLeftRadius: 4,
                            borderBottomLeftRadius: 4,
                          }}
                        >
                          BEST VALUE
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div" align="center">
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" color="primary" align="center" sx={{ fontWeight: 'bold', my: 2 }}>
                          {plan.price}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <List dense>
                          {plan.features.map((feature, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: '30px' }}>
                                <CheckCircleOutline color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                        <Button 
                          variant={plan.recommended ? "contained" : "outlined"} 
                          size="large"
                          onClick={() => handleOpenSubscriptionDialog(plan.id)}
                          fullWidth
                          sx={{ mx: 2 }}
                        >
                          Subscribe Now
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Premium Labs List */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              <School sx={{ mr: 1, verticalAlign: 'middle' }} />
              Advanced Blockchain Labs
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {!isSubscribed && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Subscription Required</AlertTitle>
                These advanced labs require an active subscription to access. Choose a subscription plan above to unlock these premium labs.
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {premiumLabs.map((lab) => (
                <Grid item xs={12} md={6} key={lab.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      opacity: isSubscribed ? 1 : 0.7,
                      position: 'relative',
                    }}
                  >
                    {!isSubscribed && (
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          zIndex: 1,
                        }}
                      >
                        <LockOutlined sx={{ fontSize: 60, color: 'white' }} />
                      </Box>
                    )}
                    <Box sx={{ 
                      bgcolor: lab.color, 
                      color: 'white', 
                      p: 2, 
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      {lab.icon}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6">{lab.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip label={lab.level} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                          <Chip label={lab.estimatedTime} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" paragraph>
                        {lab.description}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Contract Files: {lab.contractFiles.join(', ')}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => handleShowLabDetails(lab.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="contained" 
                        endIcon={<ArrowForward />}
                        disabled={!isSubscribed}
                        onClick={() => handleStartLab(lab.id)}
                      >
                        Start Lab
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Subscription Dialog */}
      <Dialog
        open={showSubscriptionDialog}
        onClose={handleCloseSubscriptionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Subscribe to Premium Labs
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <>
              <DialogContentText paragraph>
                You are about to subscribe to the <strong>{selectedPlan.name}</strong> plan for <strong>{selectedPlan.price}</strong>.
              </DialogContentText>
              
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Plan Details:</Typography>
                <List dense>
                  {selectedPlan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <CheckCircleOutline color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <DialogContentText variant="body2" color="text.secondary">
                By subscribing, you will have full access to all premium labs for the duration of your subscription ({selectedPlan.duration} days).
                Your wallet will be prompted to confirm the transaction.
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseSubscriptionDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePurchaseSubscription}
            disabled={purchaseLoading}
            startIcon={purchaseLoading ? <CircularProgress size={20} /> : <AccountBalanceWallet />}
          >
            {purchaseLoading ? "Processing..." : "Confirm Purchase"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Details Dialog */}
      {showLabDetails && (
        <Dialog
          open={!!showLabDetails}
          onClose={handleCloseLabDetails}
          maxWidth="md"
          fullWidth
          scroll="paper"
        >
          <DialogTitle>
            {premiumLabs.find(lab => lab.id === showLabDetails)?.title}
          </DialogTitle>
          <DialogContent dividers>
            <LabDetailsContent 
              lab={premiumLabs.find(lab => lab.id === showLabDetails)} 
              isSubscribed={isSubscribed}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseLabDetails}>
              Close
            </Button>
            {isSubscribed ? (
              <Button 
                variant="contained" 
                endIcon={<ArrowForward />}
                onClick={() => {
                  handleCloseLabDetails();
                  handleStartLab(showLabDetails);
                }}
              >
                Start Lab
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="warning"
                onClick={() => {
                  handleCloseLabDetails();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Subscribe to Access
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

// Component for lab details content in dialog
const LabDetailsContent = ({ lab, isSubscribed }) => {
  // Mock data for lab content
  const labSteps = [
    "Understanding the Problem",
    "Setting Up the Development Environment",
    "Exploring Contract Code",
    "Building the Solution",
    "Testing & Deployment",
  ];

  // Mock content specific to each lab
  const labContent = {
    'gasless-forwarder': {
      overview: "Gasless transactions allow users to interact with smart contracts without having ETH for gas fees. Instead, a relayer pays the gas and executes the transaction on the user's behalf. This pattern is crucial for improving UX in dApps and is particularly important for onboarding new users who may not have ETH.",
      learningOutcomes: [
        "Understand meta-transactions and EIP-712 signatures",
        "Implement a secure relayer system with proper authorization",
        "Use OpenZeppelin's libraries for implementing permit functionality",
        "Create and validate cryptographic signatures for transaction authorization",
        "Build a complete gasless transaction system that's resistant to replay attacks",
      ],
      prerequisites: [
        "Solid understanding of Ethereum fundamentals",
        "Experience with Solidity and smart contract security",
        "Familiarity with cryptographic signatures",
        "Completed 'Blockchain Guardian' base levels",
      ],
      challenges: [
        "Implementing secure signature verification",
        "Preventing signature replay attacks",
        "Building an efficient relayer authorization system",
        "Managing nonces and message validation",
      ],
    },
    'cross-chain-bridge': {
      overview: "Cross-chain bridges are critical infrastructure that allow assets to move between different blockchain networks. This lab focuses on building a secure bridge between Ethereum networks (such as Sepolia testnet and Arbitrum Amoy) using relayers and Merkle proofs for validation.",
      learningOutcomes: [
        "Design and implement a secure cross-chain bridge architecture",
        "Use Merkle proofs for efficient and secure transaction verification",
        "Build relayer management systems with proper authorization",
        "Implement lock-and-mint and burn-and-release patterns",
        "Handle cross-chain transaction validation and security",
      ],
      prerequisites: [
        "Advanced knowledge of Ethereum and EVM chains",
        "Strong understanding of Merkle trees and cryptographic proofs",
        "Experience with multi-contract systems",
        "Completed the Gasless Transaction Forwarder lab",
      ],
      challenges: [
        "Ensuring bridge security across multiple chains",
        "Implementing proper validation of cross-chain messages",
        "Handling network-specific issues and chain IDs",
        "Building a robust relayer system with proper incentives",
        "Preventing double-spending and replay attacks",
      ],
    },
  };

  const content = labContent[lab.id];

  return (
    <Box>
      {!isSubscribed && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Premium Content</AlertTitle>
          This lab requires an active subscription. Subscribe to access the full content and interactive exercises.
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>Overview</Typography>
      <Typography variant="body1" paragraph>
        {content.overview}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>Learning Outcomes</Typography>
      <List>
        {content.learningOutcomes.map((outcome, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <School color="primary" />
            </ListItemIcon>
            <ListItemText primary={outcome} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>Prerequisites</Typography>
      <List dense>
        {content.prerequisites.map((prereq, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <VerifiedUser color="info" />
            </ListItemIcon>
            <ListItemText primary={prereq} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>Lab Structure</Typography>
      <Stepper activeStep={-1} orientation="vertical" sx={{ mb: 3 }}>
        {labSteps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>Technical Challenges</Typography>
      <List>
        {content.challenges.map((challenge, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <Bolt color="warning" />
            </ListItemIcon>
            <ListItemText primary={challenge} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="h6" gutterBottom>Contract Files</Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Key Contract Files ({lab.contractFiles.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {lab.contractFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <SmartToy color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary={file} 
                  secondary={
                    isSubscribed ? "View full code in lab environment" : "Subscribe to access code"
                  } 
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default PremiumLabs;