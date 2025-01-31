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

// Function to analyze user performance
const analyzePerformance = async (userId) => {
    const apiData = await loadData();

    // Filter quizzes attempted by the user
    const userQuizzes = apiData.filter(q => q.user_id === userId);

    if (userQuizzes.length === 0) {
        return { message: "No quiz data found for this user." };
    }

    let topicPerformance = {};
    let totalAccuracy = 0, totalQuizzes = userQuizzes.length;

    userQuizzes.forEach(quiz => {
        let topic = quiz.quiz.topic;
        let accuracy = parseFloat(quiz.accuracy.replace(" %", "")); // Convert "90 %" to 90
        totalAccuracy += accuracy;

        if (!topicPerformance[topic]) {
            topicPerformance[topic] = { totalAccuracy: 0, count: 0 };
        }

        topicPerformance[topic].totalAccuracy += accuracy;
        topicPerformance[topic].count += 1;
    });

    // Compute average accuracy per topic
    let insights = Object.entries(topicPerformance).map(([topic, data]) => ({
        topic,
        avg_accuracy: (data.totalAccuracy / data.count).toFixed(2) + " %",
        strength: (data.totalAccuracy / data.count) > 65 ? "Strong" : "Weak"
    }));

    return {
        userId,
        overall_accuracy: (totalAccuracy / totalQuizzes).toFixed(2) + " %",
        topics: insights
    };
};

// Define the /analyze route API Endpoint
router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const analysis = await analyzePerformance(userId);
    res.json(analysis);
});

// Route: Get only strong subjects
router.get("/strong-subjects", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const analysis = await analyzePerformance(userId);
    const strongSubjects = analysis.topics.filter(topic => topic.strength === "Strong");

    res.json({
        userId,
        strong_subjects: strongSubjects
    });
})

// Route: Get only weak subjects
router.get("/weak-subjects", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const analysis = await analyzePerformance(userId);
    const weakSubjects = analysis.topics.filter(topic => topic.strength === "Weak");

    res.json({
        userId,
        weak_subjects: weakSubjects
    });
});

export default router;