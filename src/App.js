import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import About from './pages/about';
import Dashboard from './pages/dashboard';
import Models from './pages/Models';
import Retrain from './pages/retrain';

function Header() {
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="navbar-title">BREATHAI</div>
      </div>
      <div className="navbar-right">
        <button className="about-btn" onClick={() => navigate('/about')}>About</button>
        <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="retrain-btn" onClick={() => navigate('/retrain')}>Retrain</button>
        <button className="models-btn" onClick={() => navigate('/models')}>Models</button>
        <button className="login-btn" onClick={() => setAccount(account ? null : 'UserAccount')}>
          {account ? 'Logout' : 'Login'}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Header /> {/* Include the Header component */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/retrain" element={<Retrain />} />
          <Route path="/models" element={<Models />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
