import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import './dashboard.css';

const Dashboard=() =>{
    const navigate = useNavigate();
    const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [timesAdmitted, setTimesAdmitted] = useState('');
    const [diagnosticCodes, setDiagnosticCodes] = useState([]); //Available codes from database
    const [selectedCodes, setSelectedCodes] = useState([]); // Selected codes 
    const [prediction, setPrediction] = useState(null);
    const [errors, setErrors] = useState({});

    //Fetch diagnostic codes from backend
    useEffect(() => {
      async function fetchDiagnosticCodes() {
          try {
              const response = await axios.get("http://localhost:5001/diagnostic-codes");
              console.log("Fetched Diagnostic Codes:", response.data.codes);
              setDiagnosticCodes(response.data.codes);
          } catch (error) {
              console.error("Failed to load diagnostic codes:", error);
          }
      }
      fetchDiagnosticCodes();
    }, []);

  //To handle multiple selection of codes
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedCodes.includes(selectedValue)) {
        setSelectedCodes([...selectedCodes, selectedValue]); // Add code if not already selected
    }
  };

  // Handle removal of selected codes
  const removeCode = (code) => {
      setSelectedCodes(selectedCodes.filter(c => c !== code));
  };

    // Handle form submission
  const handlePredict = async () => {
    let validationErrors = {};

    // Check if each field is filled
    if (!gender || gender.trim() === '') validationErrors.gender = '*Gender is required';
    if (!age || age.trim() === '' || parseInt(age) <= 0) validationErrors.age = '*Age is required and must be greater than 0';
    if (!timesAdmitted || timesAdmitted.trim() === '' || parseInt(timesAdmitted) <= 0) validationErrors.timesAdmitted = '*Number of times admitted is required and must be greater than 0';
    if (selectedCodes.length === 0){
      validationErrors.diagnosticCode = '*At least one diagnostic code is required';
      console.log("No diagnostic code.")
    } 

    // Set error messages
    setErrors(validationErrors);

    // Check if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
        console.log("❌ Validation failed", validationErrors);
        alert("Please fill in all required fields correctly.");
        return;
    }

    // If all fields are filled, proceed with prediction
    try {
        const response = await axios.post("http://localhost:5001/predict", {
            gender: gender.trim(),
            age: parseInt(age),  // Ensure age is a number
            readmissions: parseInt(timesAdmitted), // Ensure times admitted is a number
            diagnosticCodes: selectedCodes, // Send the selected codes
        });

        setPrediction(response.data.prediction);
    } catch (error) {
        console.error("Prediction failed:", error);
        console.log("Request data was:", error.config.data);
        alert(error.response?.data?.error || "Error making prediction");
    }
};
    
    const handleCollection = () => {
      navigate('/collection');
    };

    return (
          <div className="dashboard-container">
          <div className="results-container">
          <div className="results-group estimated-survival">
            <h3>Estimated Survival</h3>
            <div className="metric-cards">
            <div className="probability">
              <h3>6 month</h3>
              <p>{prediction ? prediction.survival_6_month.toFixed(3) : "N/A"}</p>
            </div>
            <div className="probability">
              <h3>12 month</h3>
              <p>{prediction ? prediction.survival_12_month.toFixed(3) : "N/A"}</p>
            </div>
          </div>
          </div>

        <div className="results-group estimated-readmission">
          <h3>Estimated Readmission</h3>
          <div className="metric-cards">
          <div className="probability">
            <h3>1 year</h3>
            <p>{prediction ? prediction.readmission_1_year.toFixed(3) : "N/A"}</p>
          </div>
          <div className="probability">
            <h3>5 year</h3>
            <p>{prediction ? prediction.readmission_5_year.toFixed(3) : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

        {/* Form Section */}
        <div className="main-content">
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
                  onChange={handleSelectChange}>
                <option value="" disabled selected>Choose codes</option>
                {diagnosticCodes.map((code) => (
                    <option key={code} value={code}>{code}</option>
                ))}
            </select>
            {errors.diagnosticCodes && <p className="error-message">{errors.diagnosticCodes}</p>}
                {/* Show selected codes with delete button */}
                <div className="selected-codes">
                    {selectedCodes.map((code) => (
                        <span key={code} className="selected-code">
                            {code} 
                            <button onClick={() => removeCode(code)}>❌</button>
                        </span>
                    ))}
                </div>

            
      
    
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
        </div>
      );
    };
  
  export default Dashboard;