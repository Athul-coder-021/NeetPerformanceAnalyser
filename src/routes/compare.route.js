import express from "express";
import fs from "fs/promises"; // Using promises for async file read

const router = express.Router();

// Function to load API data
// Load JSON data (simulate fetching from API)
const loadData = async () => {
    try {
        const data = await fs.readFile("./src/ApiFiles/APIEndpoint.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading API data:", error);
        return [];
    }
};

router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const apiData = await loadData();
    const userQuizzes = apiData.filter(q => q.user_id === userId);
    if (userQuizzes.length === 0) {
        return res.status(404).json({ message: "No quiz data found for this user." });
    }

    // Get all user scores
    const allScores = apiData.map(q => q.score);
    const userScore = userQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / userQuizzes.length;

    // Calculate percentile rank
    const percentile = (allScores.filter(score => score < userScore).length / allScores.length) * 100;

    res.json({
        userId,
        userScore,
        percentile: percentile.toFixed(2) + "%",
        performance_level: percentile > 80 ? "Top Performer" : percentile > 50 ? "Average" : "Needs Improvement"
    });
});


export default router;