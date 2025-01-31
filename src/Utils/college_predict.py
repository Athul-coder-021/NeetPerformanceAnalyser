import sys
import pickle
import pandas as pd
import json  # Add the json library to format the output as JSON

# Load the trained model and mappings
with open('./src/Utils/dtree_model.pkl', 'rb') as model_file:
    dtree_model = pickle.load(model_file)

with open('./src/Utils/clg_mapping.pkl', 'rb') as mapping_file:
    int_to_clg = pickle.load(mapping_file)

# Receive inputs from command line arguments
rank = int(sys.argv[1])
alloted_cat = sys.argv[2]
candidate_cat = sys.argv[3]
course = sys.argv[4]

# Define mappings for categories and courses
category_mapping = {
    "1": "UR", "2": "UR PH", "3": "OBC", "4": "OBC PH", 
    "5": "SC", "6": "SC PH", "7": "ST", "8": "ST PH"
}

course_mapping = {
    "1": "MBBS", "2": "BDS"
}

# Prepare the input data for prediction
test = { 
    '1': rank, 
    '3_BDS': 0, '3_MBBS': 0, '4_OBC': 0, '4_OBC PH': 0, '4_SC': 0, '4_SC PH': 0, 
    '4_ST': 0, '4_ST PH': 0, '4_UR': 0, '4_UR PH': 0, '5_OBC': 0, '5_OBC PH': 0, 
    '5_SC': 0, '5_SC PH': 0, '5_ST': 0, '5_ST PH': 0, '5_UR': 0, '5_UR PH': 0
}

# Set the values for the course, allotted category, and candidate category
test[f'3_{course_mapping[course]}'] = 1
test[f'4_{category_mapping[alloted_cat]}'] = 1
test[f'5_{category_mapping[candidate_cat]}'] = 1

# Convert the test data into a DataFrame
test_df = pd.DataFrame([test])

# Align the columns with the model's expected feature names
test_df.columns = test_df.columns.astype(str)

# Ensure the test data has all the expected columns
missing_cols = set(dtree_model.feature_names_in_) - set(test_df.columns)
for col in missing_cols:
    test_df[col] = 0  # Add missing columns with default values

# Align the columns with the model's expected column order
test_df = test_df[dtree_model.feature_names_in_]

# Make the prediction
predicted_college_id = dtree_model.predict(test_df)[0]

# Ensure predicted_college_id is an integer
predicted_college_id = int(predicted_college_id)  # Cast to int

# Get the predicted college from the mapping
predicted_college = int_to_clg.get(predicted_college_id, "Unknown College")

# Generate a range of nearby colleges
nearby_colleges = []
for i in range(predicted_college_id - 3, predicted_college_id + 4):
    if 0 <= i < len(int_to_clg):
        nearby_colleges.append(int_to_clg[i])

# Output the nearby colleges as a JSON string
print(json.dumps(nearby_colleges))  # Print the result as valid JSON
