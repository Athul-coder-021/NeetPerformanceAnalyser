import express from "express";
import { spawn } from "child_process";

const router = express.Router();

// Endpoint to predict rank based on score
router.post("/", (req, res) => {
  const { score } = req.query;

  // Validate score
  if (!score || isNaN(score)) {
    return res.status(400).json({ error: "Invalid score. Please provide a valid number." });
  }

  const numericScore = parseFloat(score);
  const pythonProcess = spawn("python", ["./src/Utils/rank_predictor.py", numericScore]);

  let outputData = "";
  let errorOccurred = false;

  // Capture stdout data
  pythonProcess.stdout.on("data", (data) => {
    outputData += data.toString();
  });

  // Handle stderr errors properly
  pythonProcess.stderr.on("data", (error) => {
    console.error(`Error from Python: ${error}`);
    errorOccurred = true;
  });

  // Ensure response is sent **only once**
  pythonProcess.on("close", (code) => {
    if (errorOccurred) {
      return res.status(500).json({ error: "Python script execution error." });
    }
    if (code === 0) {
      const predictedRank = parseInt(outputData.trim(), 10);
      res.json({ predicted_rank: predictedRank });
    } else {
      res.status(500).json({ error: "Failed to predict rank." });
    }
  });
});

export default router;
