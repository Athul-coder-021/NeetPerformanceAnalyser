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

    const trend = userQuizzes.map(quiz => ({
        quiz_id: quiz.quiz_id,
        date: quiz.submitted_at,
        score: quiz.score,
        accuracy: quiz.accuracy
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ userId, trend });
});


export default router;