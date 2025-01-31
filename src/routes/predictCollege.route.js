import express from 'express';
import { spawn } from "child_process";

const router = express.Router();

// Endpoint to predict college based on score, rank, and other inputs
router.post("/", (req, res) => {
    const { score, alloted_cat, candidate_cat, course } = req.body;
    // alloted_cat = candidate_cat; // For now, we are assuming that the alloted category is the same as the candidate category
    // Check if the score is a valid number
    if (isNaN(score)) {
        return res.status(400).json({ error: "Invalid score" });
    }

    // Step 1: Predict the rank based on the score
    const pythonProcessForRank = spawn("python", ["./src/Utils/rank_predictor.py", score]);

    pythonProcessForRank.stdout.on("data", (data) => {
        const predictedRank = parseInt(data.toString().trim(), 10); // Clean output

        // Step 2: Use the predicted rank and other inputs to predict the college
        const pythonProcessForCollege = spawn("python", [
            "./src/Utils/college_predict.py",
            predictedRank,
            alloted_cat,
            candidate_cat,
            course,
        ]);

        pythonProcessForCollege.stdout.on("data", (collegeData) => {
            const predictedColleges = JSON.parse(collegeData.toString()); // Clean output and parse as JSON
            res.json({ predicted_colleges: predictedColleges });
        });

        pythonProcessForCollege.stderr.on("data", (error) => {
            console.error(`Error in college prediction: ${error}`);
            res.status(500).json({ error: "Failed to predict college" });
        });
    });

    // Handle error if Python process fails for rank prediction
    pythonProcessForRank.stderr.on("data", (error) => {
        console.error(`Error in rank prediction: ${error}`);
        res.status(500).json({ error: "Failed to predict rank" });
    });
});

export default router;