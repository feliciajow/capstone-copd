const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { PythonShell } = require("python-shell");
const { spawn } = require("child_process");
const fs = require("fs"); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Connect database
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "cghrespi",
    port: 5432,
});

//Fetching diagnostic codes from database
app.get("/diagnostic-codes", async (req, res) => {
    try {
        const result = await pool.query("SELECT code_name FROM diagnostic_codes");
        const codes = result.rows.map(row => row.code_name); // Convert to array
        res.json({ codes });
    } catch (error) {
        console.error("Error loading diagnostic codes:", error);
        res.status(500).json({ error: "Failed to load diagnostic codes" });
    }
});

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

//Load latest model from database
async function loadModel(userid) {
    try {
        const result = await pool.query(
            "SELECT model_data FROM models WHERE userid = $1 ORDER BY timestamp DESC LIMIT 1",
            [userid]
        );

        if (result.rows.length > 0) {
            return result.rows[0].model_data; // Return the binary model data
        } else {
            console.log("⚠️ No model found in PostgreSQL for this user");
            return null;
        }
    } catch (error) {
        console.error("❌ Error loading model from PostgreSQL:", error);
        return null;
    }
}
//, diagnosticCodes
app.post("/predict", async (req, res) => {
    const { email, gender, age, readmissions, diagnosticCodes } = req.body;
    if (!email || !gender || !age || !readmissions || !diagnosticCodes) {
        return res.status(400).json({ error: "All input fields are required" });
    }

    try {
        // Get userid from email
        const userResult = await pool.query("SELECT userid FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        const userid = userResult.rows[0].userid;

        // Load the latest model from PostgreSQL
        const modelBinary = await loadModel(userid);
        if (!modelBinary) {
            return res.status(404).json({ error: "No trained models found." });
        }

        // Fetch all possible diagnostic codes from database
        const codeResult = await pool.query("SELECT code_name FROM diagnostic_codes");
        const allCodes = codeResult.rows.map(row => row.code_name); // List of all possible codes

        // Convert diagnosticCodes input to a binary vector
        const binaryInput = allCodes.map(code => (diagnosticCodes.includes(code) ? 1 : 0));

        // Call Python script for prediction
        let options = {
            mode: "text",
            pythonOptions: ["-u"], // Unbuffered output
            scriptPath: "./", 
            args: [
                modelBinary.toString("base64"), // Convert binary model to Base64 string
                gender,
                age,
                readmissions,
                ...binaryInput
            ],
        };

        const python = spawn("python", ["predict.py", ...options.args]);

        let predictionResult = "";
        python.stdout.on("data", (data) => {
            predictionResult += data.toString();
        });

        python.stderr.on("data", (data) => {
            console.error("❌ Python error:", data.toString());
        });

        python.on("close", () => {
            try {
                res.json({ prediction: JSON.parse(predictionResult) });
            } catch (error) {
                res.status(500).json({ error: "Failed to parse prediction output" });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});


const PORT = 5001;
app.listen(PORT, () => {
    console.log(`DASHBOARD running on http://localhost:${PORT}`);
});