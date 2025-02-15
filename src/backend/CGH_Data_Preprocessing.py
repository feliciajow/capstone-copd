from datetime import datetime
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import argparse
from lifelines import CoxPHFitter

import umap.umap_ as umap
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
import mca
import icd10

# Function to get description from ICD-10 code
def get_icd10_description(code):
    node = icd10.find(code)  # Find the ICD-10 code in the hierarchy
    return node.description if node else "Unknown Diagnosis"

# Example mapping
example_code = "Z51"
print(f"{example_code}: {get_icd10_description(example_code)}")

# Parse command line arguments
parser = argparse.ArgumentParser(description='Process COPD patient data')
parser.add_argument('input_file', help='Input Excel file path')
parser.add_argument('output_file', help='Output CSV file path')
args = parser.parse_args()

# What Diagnosis are you interested in?
diagnostic_interest = "J44"

# loading of raw data
print(f"Loading data from {args.input_file}")
raw_df = pd.read_excel(args.input_file)

# ## 2.2 Data Manipulation

# ### 2.2.1 Datetime Processing

# Convert columns to datetime format and keep only the year, month, and day
date_columns = ['Admit/Visit Date/Time', 'Date of Birth', 'Death Date', 'Discharge Date/Time']

for col in date_columns:
    raw_df[col] = pd.to_datetime(raw_df[col]).dt.date  # Extracts the date part (year-month-day)

# converting Columns related to Time to a Datetime Dtype
raw_df['Admit/Visit Date/Time'] = pd.to_datetime(raw_df['Admit/Visit Date/Time'])
raw_df['Discharge Date/Time'] = pd.to_datetime(raw_df['Discharge Date/Time'])
raw_df['Death Date'] = pd.to_datetime(raw_df['Death Date'])
raw_df['Date of Birth'] = pd.to_datetime(raw_df['Date of Birth'])

# ### 2.2.2 Date Filtering

# we are only looking at Data from 1st Oct 2017 to 1st June 2023
start_date = pd.Timestamp('2017-10-01')
end_date = pd.Timestamp('2023-06-01')
datefiltered_df = raw_df[(raw_df['Admit/Visit Date/Time'] >= start_date) & (raw_df['Admit/Visit Date/Time'] <= end_date)]
datefiltered_df_df = datefiltered_df.sort_values(by=['Patient ID', 'Admit/Visit Date/Time'])

# ### 2.2.3 Case Type Filtering

# only keep a&e and inpatient
casetype_df = datefiltered_df_df[
    (datefiltered_df_df['Case Type Description'] == 'A&E') |
    (datefiltered_df_df['Case Type Description'] == 'Inpatient')
    ]

# Filter out rows where Date of Birth is greater than Admit/Visit Date/Time
df_filtered = casetype_df[casetype_df['Date of Birth'] <= casetype_df['Admit/Visit Date/Time']]

today_date = datetime.now()

# FOR SURVIVAL DURATION (DAYS)
df_filtered['Survival Duration (Days)'] = np.where(
    df_filtered['Death Date'].isna(), 
    (today_date - df_filtered['Admit/Visit Date/Time']).dt.days,  # If 'death' is NaT, use today_date
    (df_filtered['Death Date'] - df_filtered['Admit/Visit Date/Time']).dt.days)  # If 'death' has a value, use death date

# FOR AGE
df_filtered['Age'] = np.where(
    df_filtered['Death Date'].isna(), 
    round((today_date - df_filtered['Date of Birth']).dt.days/365),  # If 'death' is NaT, use today_date
    round((df_filtered['Death Date'] - df_filtered['Date of Birth']).dt.days/365)
    )  # If 'death' has a value, use death date

# FOR GENDER
df_filtered['Gender'] = df_filtered['Gender'].map({'MALE': 1, 'FEMALE': 0})

# FOR DEAD
df_filtered["Dead"] = df_filtered["Death Date"].notna().astype(int)

# Step 1: Filter rows with diagnosis
patients_of_interest = df_filtered[df_filtered['Primary Diagnosis Code (Mediclaim)'].str.contains(diagnostic_interest, na=False)]

# Step 2: Initialize readmission column as a count
df_filtered['Readmission'] = 0  # Default to 0

# Step 3: Check for inpatient readmissions
for patient_id, patient_visits in patients_of_interest.groupby('Patient ID'):
    # Sort visits by date for the patient
    patient_visits = patient_visits.sort_values(by='Admit/Visit Date/Time')
    readmission_date = None

    for index, row in patient_visits.iterrows():
        visit_date = row['Admit/Visit Date/Time']
        case_type = row['Case Type Description']

        # If this is the first visit, set the baseline and continue
        if readmission_date is None:
            readmission_date = visit_date
            continue

        # Find subsequent admissions that are inpatient
        if (visit_date > readmission_date) and (case_type == 'Inpatient'):
            df_filtered.loc[index, 'Readmission'] += 1
            readmission_date = visit_date  # Update the baseline date to this readmission

# Step 4: Aggregate the maximum values for each patient
patient_max_values = df_filtered.groupby('Patient ID')[['Readmission']].max()

# Step 5: Map the maximum values back to all rows for each patient
df_filtered['Readmission'] = df_filtered['Patient ID'].map(patient_max_values['Readmission'])

# Continuously remove rows with the minimum survival duration until the minimum is at least 0
while df_filtered['Survival Duration (Days)'].min() < 0:
    min_survival_duration = df_filtered['Survival Duration (Days)'].min()
    df_filtered = df_filtered[df_filtered['Survival Duration (Days)'] != min_survival_duration]

# Confirm the new minimum survival duration
new_min_survival_duration = df_filtered['Survival Duration (Days)'].min()
new_min_survival_duration


# Create a new column: 1 if death occurs within 6 months (180 days), 0 otherwise
df_filtered['Death in 6 Months'] = df_filtered['Survival Duration (Days)'].apply(
    lambda x: 1 if pd.notnull(x) and x <= 180 else 0
)

df_filtered['Death in 12 Months'] = df_filtered['Survival Duration (Days)'].apply(
    lambda x: 1 if pd.notnull(x) and x <= 365 else 0
)

df_filtered.head()


# Step 1: Identify patients with Death in 6 Months
patients_death_6_months = set(df_filtered[df_filtered['Death in 6 Months'] == 1]['Patient ID'])

# Step 2: Mark all rows for those patients as 1 for Death in 6 Months
df_filtered.loc[df_filtered['Patient ID'].isin(patients_death_6_months), 'Death in 6 Months'] = 1

# Step 3: Identify patients with Death in 12 Months
patients_death_12_months = set(df_filtered[df_filtered['Death in 12 Months'] == 1]['Patient ID'])

# Step 4: Mark all rows for those patients as 1 for Death in 12 Months
df_filtered.loc[df_filtered['Patient ID'].isin(patients_death_12_months), 'Death in 12 Months'] = 1


# Step 1: Filter rows with diagnosis
patients_of_interet = df_filtered[df_filtered['Primary Diagnosis Code (Mediclaim)'].str.contains(diagnostic_interest, na=False)]

# Step 2: Initialize readmission column and count column
df_filtered['Readmission in 6 Months'] = 0  # Default to 0
df_filtered['Readmission Count in 6 Months'] = 0  # Count of readmissions

# Step 3: Iterate through patients to track readmissions
for patient_id, patient_visits in patients_of_interet.groupby('Patient ID'):
    # Sort visits by date for each patient
    patient_visits = patient_visits.sort_values(by='Admit/Visit Date/Time')
    readmission_date = None
    readmission_count = 0

    # Iterate through each visit for the patient
    for _, visit in patient_visits.iterrows():
        visit_date = visit['Admit/Visit Date/Time']
        case_type = visit['Case Type Description']

        # For the first admission, only set the baseline date
        if readmission_date is None:
            readmission_date = visit_date  # Set the new baseline for readmission
        else:
            # Check if the visit qualifies as a readmission
            if (
                visit_date > readmission_date and
                visit_date <= readmission_date + pd.Timedelta(days=180) and
                case_type == 'Inpatient'  # Subsequent visits must be Inpatient
            ):
                # Increment the readmission count
                readmission_count += 1

                # Update the DataFrame for this visit
                df_filtered.loc[
                    (df_filtered['Patient ID'] == patient_id) &
                    (df_filtered['Admit/Visit Date/Time'] == visit_date),
                    'Readmission Count in 6 Months'
                ] = readmission_count

                df_filtered.loc[
                    (df_filtered['Patient ID'] == patient_id) &
                    (df_filtered['Admit/Visit Date/Time'] == visit_date),
                    'Readmission in 6 Months'
                ] = 1

                # Update the baseline to this readmission date
                readmission_date = visit_date
            elif visit_date > readmission_date + pd.Timedelta(days=180):
                # Reset the baseline date if it's outside the 6-month window
                readmission_date = visit_date

# Step 4: Aggregate the maximum values for each patient
patient_max_values = df_filtered.groupby('Patient ID')[['Readmission Count in 6 Months', 'Readmission in 6 Months']].max()

# Step 5: Map the maximum values back to all rows for each patient
df_filtered['Readmission Count in 6 Months'] = df_filtered['Patient ID'].map(patient_max_values['Readmission Count in 6 Months'])
df_filtered['Readmission in 6 Months'] = df_filtered['Patient ID'].map(patient_max_values['Readmission in 6 Months'])

# Step 1: Filter rows with diagnosis
patients_of_interest = df_filtered[df_filtered['Primary Diagnosis Code (Mediclaim)'].str.contains(diagnostic_interest, na=False)]

# Step 2: Initialize readmission column and count column
df_filtered['Readmission in 12 Months'] = 0  # Default to 0
df_filtered['Readmission Count in 12 Months'] = 0  # Count of readmissions

# Step 3: Iterate through patients to track readmissions
for patient_id, patient_visits in patients_of_interest.groupby('Patient ID'):
    # Sort visits by date for each patient
    patient_visits = patient_visits.sort_values(by='Admit/Visit Date/Time')
    readmission_date = None
    readmission_count = 0

    # Iterate through each visit for the patient
    for _, visit in patient_visits.iterrows():
        visit_date = visit['Admit/Visit Date/Time']
        case_type = visit['Case Type Description']

        # For the first admission, only set the baseline date
        if readmission_date is None:
            readmission_date = visit_date  # Set the new baseline for readmission
        else:
            # Check if the visit qualifies as a readmission
            if (
                visit_date > readmission_date and
                visit_date <= readmission_date + pd.Timedelta(days=365) and
                case_type == 'Inpatient'  # Subsequent visits must be Inpatient
            ):
                # Increment the readmission count
                readmission_count += 1

                # Update the DataFrame for this visit
                df_filtered.loc[
                    (df_filtered['Patient ID'] == patient_id) &
                    (df_filtered['Admit/Visit Date/Time'] == visit_date),
                    'Readmission Count in 12 Months'
                ] = readmission_count

                df_filtered.loc[
                    (df_filtered['Patient ID'] == patient_id) &
                    (df_filtered['Admit/Visit Date/Time'] == visit_date),
                    'Readmission in 12 Months'
                ] = 1

                # Update the baseline to this readmission date
                readmission_date = visit_date
            elif visit_date > readmission_date + pd.Timedelta(days=365):
                # Reset the baseline date if it's outside the 6-month window
                readmission_date = visit_date

# Step 4: Aggregate the maximum values for each patient
patient_max_values = df_filtered.groupby('Patient ID')[['Readmission Count in 12 Months', 'Readmission in 12 Months']].max()

# Step 5: Map the maximum values back to all rows for each patient
df_filtered['Readmission Count in 12 Months'] = df_filtered['Patient ID'].map(patient_max_values['Readmission Count in 12 Months'])
df_filtered['Readmission in 12 Months'] = df_filtered['Patient ID'].map(patient_max_values['Readmission in 12 Months'])

# ### 2.2.5 Diagnostic  Code Engineering

# #### 2.2.5.1 Join Primary and Secondary Diagnostic Codes together to "Combined Diagnoses"

# Fill missing secondary diagnosis codes with empty strings for consistency
df_filtered["Secondary Diagnosis Code Concat (Mediclaim)"].fillna("", inplace=True)

# Combine primary and secondary diagnosis codes into a single column for processing
df_filtered["Combined Diagnoses"] = df_filtered["Primary Diagnosis Code (Mediclaim)"] + "," + df_filtered["Secondary Diagnosis Code Concat (Mediclaim)"]

# First, replace any instances of '||' with ',' for consistent splitting.
df_filtered["Combined Diagnoses"] = df_filtered["Combined Diagnoses"].str.replace('||', ',', regex=False)

# pd.reset_option('display.max_rows')  # This removes the row display limit

# #### 2.2.5.2 Combine all the Diagnostic codes of each patient together
# #### Making sure Primary Diagnostic code remains as the first code for each row
# #### Assumption: Patient's death is due to all diagnostic codes that he/she has/had

# Group the DataFrame by 'Patient ID' to get all diagnosis codes for each patient
grouped_df = df_filtered.groupby('Patient ID').agg({
    'Primary Diagnosis Code (Mediclaim)': lambda x: ','.join(x.unique()),
    'Secondary Diagnosis Code Concat (Mediclaim)': lambda x: '||'.join(filter(pd.notna, x.unique()))
}).reset_index()

# Function to apply the combined diagnosis codes for all rows, keeping primary code as first
def apply_combined_diagnoses(row):
    patient_id = row['Patient ID']
    primary_code = row['Primary Diagnosis Code (Mediclaim)']
    
    # Get combined primary and secondary diagnosis codes for the patient
    combined_data = grouped_df[grouped_df['Patient ID'] == patient_id]
    combined_secondary = combined_data['Secondary Diagnosis Code Concat (Mediclaim)'].values[0]
    
    # Ensure primary code comes first in the combined diagnosis column
    if pd.notna(combined_secondary):
        combined_diagnosis = f"{primary_code},{combined_secondary}"
    else:
        combined_diagnosis = primary_code

    return combined_diagnosis

# Apply the function to each row
df_filtered['Combined Diagnoses'] = df_filtered.apply(apply_combined_diagnoses, axis=1)

# #### 2.2.5.3 Making sure the Combined Diagnoses are separated by ","

# In[110]:


# Replace '||' and ',||' with ',' in the 'Combined Diagnoses' column to ensure consistent separation
df_filtered['Combined Diagnoses'] = df_filtered['Combined Diagnoses'].replace({'\|\|': ',', ',\|\|': ','}, regex=True)
df_filtered['Combined Diagnoses'] = df_filtered['Combined Diagnoses'].replace({',,': ','}, regex=True)

def remove_trailing_comma(diagnosis_str):
    # Remove trailing commas from the string
    return diagnosis_str.rstrip(',')

# Apply the function to the "Processed Diagnoses" column
df_filtered['Combined Diagnoses'] = df_filtered['Combined Diagnoses'].apply(remove_trailing_comma)

# #### 2.2.5.4 Getting first 3 Number/Alphabet of each Diagnostic Code
# #### It was mentioned that we can focus on the first 3 characters, this will help us reduce the number of dimensions as well.

# In[111]:


# Define a function to process the "Combined Diagnoses" column as per the requirements
def process_diagnoses(diagnosis_str):
    # Split the diagnoses by comma
    diagnoses = diagnosis_str.split(',')
    # Take the first 3 characters of each diagnosis code and remove duplicates
    processed_diagnoses = list(dict.fromkeys([diag[:3] for diag in diagnoses]))
    # Join back to a comma-separated string
    return ','.join(processed_diagnoses)

# Apply the function to the "Combined Diagnoses" column
df_filtered['Processed Diagnoses'] = df_filtered['Combined Diagnoses'].apply(process_diagnoses)
df_filtered = df_filtered.drop(columns="Combined Diagnoses")

# ### 2.2.6 Filtering for Patients of Interest

df_filtered = df_filtered[df_filtered['Processed Diagnoses'].str.startswith(diagnostic_interest)]

# Remove duplicate Patient IDs, keeping the first occurrence
df_filtered = df_filtered.drop_duplicates(subset='Patient ID')

# ### 2.2.7 One Hot Encoding on Diagnostic Codes

# Split the truncated diagnosis codes into one-hot encoded columns
diagnosis_dummies_expanded = df_filtered["Processed Diagnoses"].str.get_dummies(sep=",")

# Combine 'Patient ID', 'Dead', and the one-hot encoded diagnosis codes
overview_df = pd.concat([df_filtered[["Patient ID", "Gender", "Age", "Dead", "Death in 6 Months", "Death in 12 Months", "Readmission", "Readmission in 6 Months", "Readmission in 12 Months", "Survival Duration (Days)"]], diagnosis_dummies_expanded], axis=1)

# ### 2.2.8 Dimension Reduction Techniques

# Summing the values in each column to get the total count of each diagnostic code
diagnostic_code_counts = overview_df.iloc[:, 1:]
diagnostic_code_counts = diagnostic_code_counts.sum(axis=0)

# Sorting by count in descending order
diagnostic_code_counts_sorted = diagnostic_code_counts.sort_values(ascending=True)

print(diagnostic_code_counts_sorted)

code_count = diagnostic_code_counts_sorted.get(diagnostic_interest, 0)
print(f"Count of {diagnostic_interest}: {code_count}")


# #### Keeping only Counts that are >= 1% of Diagnostic Code Count

valid_codes = diagnostic_code_counts_sorted[diagnostic_code_counts_sorted >= code_count/100].index

# Define columns to retain
retain_columns = [
    "Patient ID", "Gender", "Age", "Dead", "Death in 12 Months", 
    "Readmission", "Readmission in 6 Months", "Readmission in 12 Months"
]

# Combine valid_codes and retain_columns, ensuring uniqueness with a set
columns_to_keep = list(set(valid_codes).union(retain_columns))

# Filter the DataFrame with unique columns
overview_df = overview_df[columns_to_keep]

overview_df = overview_df.drop(columns=[diagnostic_interest])

diagnostic_drop_df = overview_df.drop(columns=["Patient ID", "Gender", "Age", "Death in 6 Months", "Death in 12 Months", "Readmission", "Readmission in 6 Months", "Readmission in 12 Months"])
diagnostic_drop_df


# #### Perform Cox Proportional Hazards Model to remove Low Significant Codes

diagnostic_drop_df_cox = diagnostic_drop_df.reset_index(drop=True)

# Fit the model
cph = CoxPHFitter(alpha=0.05)
cph.fit(diagnostic_drop_df_cox, 'Survival Duration (Days)', 'Dead')

# #### getting low significant code

# Filter significant variables with p-value less than 0.05
insignificant_vars = cph.summary[cph.summary['p'] > 0.05]
# #### dropping insignificant codes

# Create a list of significant codes
insignificant_codes = insignificant_vars.index.tolist()

working_df = overview_df.drop(columns=insignificant_codes)
working_df = working_df.drop(columns=["Death in 6 Months", "Death in 12 Months", "Readmission in 6 Months", "Readmission in 12 Months"])
# Save the final DataFrame to the output CSV file
print("Saving processed data to", args.output_file)
working_df.to_csv(args.output_file, index=False)
print("Data processing complete!")
