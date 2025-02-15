import sys
import pickle
import json
import numpy as np
from sksurv.ensemble import RandomSurvivalForest

# Load model from file
try:
    with open(sys.argv[1], 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    print(json.dumps({"error": f"Model loading failed: {str(e)}"}))
    sys.exit(1)

# Process input parameters
try:
    gender = int(sys.argv[2])
    age = int(sys.argv[3])
    readmissions = int(sys.argv[4])
    diagnostic_codes = sys.argv[5].split(',')
    
    diagnostic_codes = [int(code) for code in diagnostic_codes]

    # Combine all features
    features = [gender, age, readmissions] + diagnostic_codes
    input_data = np.array([features])

    # Predict survival function
    survival_funcs = model.predict_survival_function(input_data)
    
    # Survival and readmission probabilities at 6 months, 12 months, 1 year, 5 year
    survival_6_month = float(survival_funcs[0](180))
    survival_12_month = float(survival_funcs[0](360))  
    readmission_1_year = 1 - float(survival_funcs[0](365))
    readmission_5_year = 1 - float(survival_funcs[0](1825))

    # Return json response
    print(json.dumps({
        "survival_6_month": round(survival_6_month, 3),
        "survival_12_month": round(survival_12_month, 3),
        "readmission_1_year": round(readmission_1_year, 3),
        "readmission_5_year": round(readmission_5_year, 3)
    }))

except Exception as e:
    print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
    sys.exit(1)