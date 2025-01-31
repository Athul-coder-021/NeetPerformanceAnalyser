import joblib
import sys
import numpy as np

# Load the trained model
model = joblib.load("./src/Utils/neet_rank_predictor.pkl")

try:
    # Read the score from command line arguments
    score = float(sys.argv[1])

    # Make prediction
    predicted_rank = model.predict(np.array([[score]]))[0]

    # Print the predicted rank (this output will be captured by Node.js)
    print(int(predicted_rank))  # Ensure integer output
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
