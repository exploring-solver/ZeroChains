import { initGame } from './main.js';

// Make initGame globally available
window.initGame = initGame;

// Add the initialization listener
window.addEventListener('DOMContentLoaded', async () => {
  const loadingScreen = document.getElementById('loading-screen');
  try {
    // Small delay to ensure everything is loaded
    setTimeout(async () => {
      const initialized = await window.initGame();
      if (initialized) {
        loadingScreen.style.display = 'none';
      }
    }, 1000);
  } catch (error) {
    console.error('Error initializing game:', error);
    loadingScreen.innerHTML = `
      <h1>Error</h1>
      <p>Could not connect to the Hardhat node. Please check your wallet connection and make sure Hardhat is running.</p>
      <button onclick="location.reload()">Retry</button>
    `;
  }
});