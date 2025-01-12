import React from 'react';
import { useNavigate } from 'react-router-dom';


const Dashboard=() =>{
    const navigate = useNavigate();

    const handleCollection = () => {
        navigate('/collection');
      };

    return (
      <div className="dashboard-container">
        <div className="form-section">
          <h2>Gender</h2>
          <select className="input-field">
            <option value="" disabled selected>
              Select a gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
  
          <h2>Age</h2>
          <div className="input-container">
            <input className="input-field" type="number" placeholder="Enter age" />
          </div>
  
          <h2>Number of Times Admitted</h2>
          <div className="input-container">
            <input
              className="input-field"
              type="number"
              placeholder="Enter times admitted"
            />
            <div className="input-buttons">
              <button>+</button>
              <button>-</button>
            </div>
          </div>
  
          <h2>Diagnostic Codes</h2>
          <select className="input-field">
            <option value="" disabled selected>
              Choose an option
            </option>
            <option value="code1">Code 1</option>
            <option value="code2">Code 2</option>
          </select>
  
          <button className="predict-btn">Predict</button>
        </div>
  
        <div className="chart-section">
          <h3>Survival function of a single instance</h3>
          <div className="chart">Chart Placeholder 1</div>
  
          <h3>Readmission function of a single instance</h3>
          <div className="chart">Chart Placeholder 2</div>
        </div>
      </div>
    );
  }
  
  export default Dashboard;