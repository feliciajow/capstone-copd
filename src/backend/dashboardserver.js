const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { PythonShell } = require("python-shell");


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect database
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "cghrespi",
    port: 5432,
});

// Function to fetch diagnostic codes
async function getDiagnosticCodes() {
    try {
        const result = await pool.query("SELECT code_name FROM diagnostic_codes");
        return result.rows.map(row => row.code_name);
    } catch (error) {
        console.error("Error fetching diagnostic codes:", error);
        throw error;
    }
}

// Fetch diagnostic codes from database
app.get("/diagnostic-codes", async (req, res) => {
    try {
        const codes = await getDiagnosticCodes();
        res.json({ codes });
    } catch (error) {
        res.status(500).json({ error: "Failed to load diagnostic codes" });
    }
});

// Retrieve latest trained model
async function getLatestModel() {
    try {
        const result = await pool.query(
            "SELECT modelid, model_data FROM models ORDER BY timestamp DESC LIMIT 1"
        );

        if (result.rows.length > 0) {
            return {
                modelid: result.rows[0].modelid,
                model_data: result.rows[0].model_data,
            };
        } else {
            console.log("⚠️ No model found in PostgreSQL");
            return null;
        }
    } catch (error) {
        console.error("❌ Error retrieving model from PostgreSQL:", error);
        return null;
    }
}

// Predict API
app.post("/predict", async (req, res) => {
    const { gender, age, readmissions, diagnosticCodes } = req.body;
    console.log("📥 Received Request Data:", { gender, age, readmissions, diagnosticCodes });

    if (gender === null || age === null || readmissions === null || diagnosticCodes.length === 0) {
        return res.status(400).json({ error: "All input fields are required" });
    }
    try {
        // Fetch all possible diagnostic codes
        const allDiagnosticCodes = await getDiagnosticCodes();

        // Initialize all diagnostic codes to 0
        let diagnosticInput = {};
        allDiagnosticCodes.forEach(code => diagnosticInput[code] = 0);

        // Set selected diagnostic codes to 1
        diagnosticCodes.forEach(code => {
            if (code in diagnosticInput) {
                diagnosticInput[code] = 1;
            }
        });

        console.log("Diagnostic Code Mappings:", diagnosticInput);

        // Get latest model
        const modelData = await getLatestModel();
        if (!modelData) {
            return res.status(404).json({ error: "No trained models found." });
        }

        const formattedCodes = Object.values(diagnosticInput).join(",");
        console.log("🔍 Calling Python script with:", [modelData.model_data, gender, age, readmissions, formattedCodes]);

        // Call Python script for prediction
        let options = {
            mode: "json",
            pythonOptions: ["-u"],
            args: [modelData.model_data, gender, age, readmissions, formattedCodes]
        };

        PythonShell.run("predict.py", options, (err, results) => {
            if (err) {
                console.error("❌ Python error:", err);
                return res.status(500).json({ error: "Prediction failed" });
            }
            console.log("✅ Prediction Result:", results);
            res.json({ prediction: results[0] });
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "An error occurred while making predictions." });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`DASHBOARD running on http://localhost:${PORT}`));



// //Training model for logged-in user
// app.post("/train", async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(400).json({ error: "Email is required" });
//     }

//     try {
//         // Get userid from email
//         const userResult = await pool.query("SELECT userid FROM users WHERE email = $1", [email]);
//         if (userResult.rows.length === 0) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         const userid = userResult.rows[0].userid;

//         PythonShell.run("train_model.py", null, (err, results) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ error: "Model training failed" });
//             }
//             res.json({ message: "Model trained successfully!" });
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "An error occurred" });
//     }
// });