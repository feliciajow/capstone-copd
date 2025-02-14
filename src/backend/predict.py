# import sys
# import pickle
# import json
# import base64
# import numpy as np

# # Decode the Base64 model received from Express.js
# try:
#     model_binary = base64.b64decode(sys.argv[1])
#     model = pickle.loads(model_binary)
# except Exception as e:
#     print(json.dumps({"error": f"Model loading failed: {str(e)}"}))
#     sys.exit(1)

# # Process input parameters
# try:
#     gender = int(sys.argv[2])
#     age = int(sys.argv[3])
#     readmissions = int(sys.argv[4])
#     diagnostic_codes = sys.argv[5:]

#     # Prepare input for model
#     input_data = np.array([[gender, age, readmissions] + 
#                           [1 if code in diagnostic_codes else 0 for code in model.feature_names_in_]])

#     # Predict survival function
#     survival_function = model.predict_survival_function(input_data)

#     # Extract survival probabilities
#     survival_6_month = survival_function 
#     survival_12_month = survival_function  
#     readmission_1_year = 1 - survival_12_month
#     readmission_5_year = 1 - survival_function[0](5 * 365)

#     # Return JSON response
#     print(json.dumps({
#         "survival_6_month": round(float(survival_6_month), 3),
#         "survival_12_month": round(float(survival_12_month), 3),
#         "readmission_1_year": round(float(readmission_1_year), 3),
#         "readmission_5_year": round(float(readmission_5_year), 3)
#     }))
# except Exception as e:
#     print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
#     sys.exit(1)
