import React from 'react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>About Page</h1>
      <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      <button onClick={() => navigate('/retrain')}>Go to Retrain</button>
      <button onClick={() => navigate('/models')}>Go to Models</button>
    </div>
  );
}

export default About;

