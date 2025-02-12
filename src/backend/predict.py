import sys
import pickle
import json
import base64
import numpy as np

# Load Model from PostgreSQL Binary Data
model_binary = base64.b64decode(sys.argv[1])
model = pickle.loads(model_binary)

# Read Input Data
gender = sys.argv[2]
age = int(sys.argv[3])
readmissions = int(sys.argv[4])
diagnostic_codes = sys.argv[5:]

# Prepare Input for Prediction
input_data = np.array([[gender, age, readmissions] + [1 if code in diagnostic_codes else 0 for code in model.feature_names_in_]])

# Make Predictions for Different Time Durations
survival_function = model.predict_survival_function(input_data)

# Extract survival probabilities at specific time points
survival_6_month = survival_function    #Prob of survival at 6 months 
survival_12_month = survival_function   # Prob of survival at 12 months 
readmission_1_year = 1 - survival_12_month      
readmission_5_year = 1 - survival_function   

# Convert to JSON and Print
print(json.dumps({
    "survival_6_month": survival_6_month,
    "survival_12_month": survival_12_month,
    "readmission_1_year": readmission_1_year,
    "readmission_5_year": readmission_5_year
}))
