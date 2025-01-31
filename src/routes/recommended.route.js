import express from "express";
import fs from "fs/promises"; // Async file reading

const router = express.Router();

// Function to load API data
const loadData = async () => {
    try {
        const data = await fs.readFile("./src/ApiFiles/APIEndpoint.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading API data:", error);
        return [];
    }
};

// Function to analyze performance
const analyzePerformance = async (userId) => {
    const quizzes = await loadData();

    // Filter data for the given userId
    const userQuizzes = quizzes.filter(q => q.user_id === userId);

    if (userQuizzes.length === 0) {
        return { topics: [] };
    }

    // Calculate topic-wise accuracy
    let topicPerformance = {};

    userQuizzes.forEach(quiz => {
        const topic = quiz.quiz.topic;
        const accuracy = parseFloat(quiz.accuracy); // Convert "90 %" to 90

        if (!topicPerformance[topic]) {
            topicPerformance[topic] = { count: 0, totalAccuracy: 0 };
        }

        topicPerformance[topic].count += 1;
        topicPerformance[topic].totalAccuracy += accuracy;
    });

    // Determine weak topics (accuracy below 50%)
    const topics = Object.keys(topicPerformance).map(topic => {
        const avgAccuracy = topicPerformance[topic].totalAccuracy / topicPerformance[topic].count;
        return {
            topic,
            strength: avgAccuracy < 50 ? "Weak" : "Strong",
            avgAccuracy: avgAccuracy.toFixed(2) + " %"
        };
    });

    return { topics };
};

// API Route to get recommended topics
router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const analysis = await analyzePerformance(userId);
    const weakTopics = analysis.topics.filter(topic => topic.strength === "Weak");

    res.json({
        userId,
        recommended_topics: weakTopics.map(topic => topic.topic)
    });
});

export default router;
