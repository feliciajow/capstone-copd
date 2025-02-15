import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import './dashboard.css';
import { Spin } from 'antd';

const Dashboard = () => {
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [timesAdmitted, setTimesAdmitted] = useState('');
    const [diagnosticCodes, setDiagnosticCodes] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);  
    const [prediction, setPrediction] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
        const genderMapped = gender === "female" ? 1 : gender === "male" ? 0 : null;

        if (genderMapped === null) validationErrors.gender = "*Gender is required";
        if (!age || parseInt(age) <= 0) validationErrors.age = "*Age is required";
        if (!timesAdmitted || parseInt(timesAdmitted) <= 0) validationErrors.timesAdmitted = "*Number of admissions is required";
        if (selectedCodes.length === 0) validationErrors.diagnosticCodes = "*At least one diagnostic code is required";

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5001/predict", {
                gender: genderMapped,
                age: parseInt(age),
                readmissions: parseInt(timesAdmitted),
                diagnosticCodes: selectedCodes
            });

            setPrediction(response.data);
            // Reset form input after prediction
            setGender('');
            setAge('');
            setTimesAdmitted('');
            setSelectedCodes([]);  
        } catch (error) {
            alert(error.response?.data?.error || "Error making prediction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            {loading ? (
                <div className="loading-overlay">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <div className="results-container">
                        <div className="results-group estimated-survival">
                            <h3>Estimated Survival</h3>
                            <div className="metric-cards">
                                <div className="probability">
                                    <h3>6 month</h3>
                                    <p>{prediction?.survival_6_month ? `${(prediction.survival_6_month * 100).toFixed(1)}%` : "N/A"}</p>
                                </div>
                                <div className="probability">
                                    <h3>12 month</h3>
                                    <p>{prediction?.survival_12_month ? `${(prediction.survival_12_month * 100).toFixed(1)}%` : "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="results-group estimated-readmission">
                            <h3>Estimated Readmission</h3>
                            <div className="metric-cards">
                                <div className="probability">
                                    <h3>1 year</h3>
                                    <p>{prediction?.readmission_1_year !== undefined ? `${(prediction.readmission_1_year * 100).toFixed(1)}%` : "N/A"}</p>
                                </div>
                                <div className="probability">
                                    <h3>5 year</h3>
                                    <p>{prediction?.readmission_5_year !== undefined ? `${(prediction.readmission_5_year * 100).toFixed(1)}%` : "N/A"}</p>
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
                                <option value="">Select a gender</option>
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
                                onChange={handleSelectChange}
                                value="">
                                <option value="">Choose codes</option>
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
                                        <button onClick={() => removeCode(code)}>X</button>
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
                </>
            )}
        </div>
    );
};

export default Dashboard;