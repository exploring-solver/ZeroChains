// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { GameProvider } from './contexts/GameContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Game from './pages/Game';
import Level from './pages/Level';
import Profile from './pages/Profile';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Web3Provider>
        <GameProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<Game />} />
              <Route path="/level/:id" element={<Level />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Layout>
        </GameProvider>
      </Web3Provider>
    </Router>
  );
}

export default App;