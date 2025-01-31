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

    let mistakes = {};

    userQuizzes.forEach(quiz => {
        quiz.quiz.questions_count && quiz.response_map &&
            Object.keys(quiz.response_map).forEach(questionId => {
                if (!mistakes[questionId]) mistakes[questionId] = 0;
                mistakes[questionId]++;
            });
    });

    const sortedMistakes = Object.entries(mistakes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 mistakes
        .map(([questionId, count]) => ({ questionId, count }));

    res.json({ userId, top_mistakes: sortedMistakes });
});



export default router;