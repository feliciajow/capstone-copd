import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import About from './pages/about';
import Dashboard from './pages/dashboard';
import Models from './pages/Models';
import Retrain from './pages/retrain';
import Login from './pages/login';
import Signup from './pages/signup';

function Header({email, handleLogin}) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="navbar-title" onClick={() => navigate('/about')}>BREATHAI</div>
      </div>
      <div className="navbar-right">
        <button className="about-btn" onClick={() => navigate('/about')}>About</button>
        <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="retrain-btn" onClick={() => navigate('/retrain')}>Retrain</button>
        <button className="models-btn" onClick={() => navigate('/models')}>Models</button>
        {email} 
        <button className="login-btn" onClick={() => {
          if (email){
            handleLogin(null);
          } navigate('/login'); //if no email then logout and navigate to login page
        }}>
          {email ? 'Logout' : 'Login'}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [email, setEmail] = useState(null);
  const handleLogin = (useremail) => {
    setEmail(useremail);
  };
  return (
    <Router>
      <div className="App">
        <Header email={email} handleLogin={handleLogin}/> {/* Include the Header component */}
        <Routes>
          <Route path="/login" element={<Login handleLogin={handleLogin}/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/retrain" element={<Retrain email={email}/>} />
          <Route path="/models" element={<Models email={email}/>} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
