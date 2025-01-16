import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';


const Dashboard=() =>{
    const navigate = useNavigate();
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [timesAdmitted, setTimesAdmitted] = useState('');
    const [diagnosticCode, setDiagnosticCode] = useState('');
    const [errors, setErrors] = useState({});

    // Handle form submission
    const handlePredict = () => {
    let validationErrors = {};

    // Check if each field is filled
    if (!gender || gender === '') validationErrors.gender = '*Gender is required';
    if (!age|| age==='0') validationErrors.age = '*Age is required';
    if (!timesAdmitted) validationErrors.timesAdmitted = '*Number of times admitted is required';
    if (!diagnosticCode || diagnosticCode === '') validationErrors.diagnosticCode = '*Diagnostic code is required';

    setErrors(validationErrors);

    // If no errors, proceed with prediction logic
    if (Object.keys(validationErrors).length === 0) {
      // Call prediction logic here
      console.log('Prediction logic here');
    }
  };
    
    const handleCollection = () => {
      navigate('/collection');
    };

    return (
        <div className="dashboard-container">
          {/* Form Section */}
          <div className="form-section">
            <h2>Gender</h2>
            <select 
              className="input-field"
              value={gender}
              onChange={(e) => setGender(e.target.value)}>
              <option value="" disabled selected>
                Select a gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="error-message">{errors.gender}</p>}

    
            <h2>Age</h2>
            <div className="input-container">
              <input
                className="input-field"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
              />
          </div>
          {errors.age && <p className="error-message">{errors.age}</p>}
          
          <h2>Number of Times Admitted</h2>
            <div className="input-container">
              <input
                className="input-field"
                type="number"
                value={timesAdmitted}
                onChange={(e) => setTimesAdmitted(e.target.value)}
                placeholder="Enter times admitted"
              />
          </div>
          {errors.timesAdmitted && <p className="error-message">{errors.timesAdmitted}</p>}

    
            <h2>Diagnostic Codes</h2>
            <select 
              className="input-field"
              value={diagnosticCode}
              onChange={(e) => setDiagnosticCode(e.target.value)} > 
              <option value="" disabled selected>
                Choose codes
              </option>
              <option value="code1">Code 1</option>
              <option value="code2">Code 2</option>
            </select>
            {errors.diagnosticCode && <p className="error-message">{errors.diagnosticCode}</p>}
    
            <button className="predict-btn" onClick={handlePredict}>Predict</button>
          </div>
    
          {/* Chart Section */}
          <div className="chart-section">
            <div>
              <h3>Survival Function of a Single Instance</h3>
              <div className="chart"></div>
            </div>
    
            <div>
              <h3>Readmission Function of a Single Instance</h3>
              <div className="chart"></div>
            </div>
          </div>
        </div>
      );
    };
  
  export default Dashboard;