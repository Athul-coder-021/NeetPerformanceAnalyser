import express from "express";
import fs from "fs/promises";
import ChartJS from "chart.js/auto";
import { createCanvas } from "canvas";  // Import canvas for rendering charts

const router = express.Router();

// Load JSON Data (Simulating API Fetch)
const loadData = async () => {
    try {
        const data = await fs.readFile("./src/ApiFiles/APIEndpoint.json", "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading API data:", error);
        return [];
    }
};

// Function to generate and save PNG chart
const generateChart = async (userId, trend) => {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const labels = trend.map(item => item.date);
    const scores = trend.map(item => item.score);
    const accuracy = trend.map(item => parseFloat(item.accuracy)); // Convert accuracy to number

    // Create Chart
    new ChartJS(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Score",
                    data: scores,
                    borderColor: "blue",
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    fill: true,
                },
                {
                    label: "Accuracy (%)",
                    data: accuracy,
                    borderColor: "green",
                    backgroundColor: "rgba(0, 255, 0, 0.2)",
                    fill: true,
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: true }
            }
        }
    });

    // Save as PNG
    const imagePath = `./public/trend_${userId}.png`;
    const buffer = canvas.toBuffer("image/png");
    await fs.writeFile(imagePath, buffer);

    return imagePath;
};

// API Route to Get Performance Trend & Generate Chart
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
        date: new Date(quiz.submitted_at).toISOString().split("T")[0], // Format YYYY-MM-DD
        score: quiz.score,
        accuracy: parseFloat(quiz.accuracy)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate PNG Chart
    const imagePath = await generateChart(userId, trend);

    // Send PNG File as Response
    res.sendFile(imagePath, { root: "." });
});

export default router;
