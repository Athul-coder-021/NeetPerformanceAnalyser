import express from 'express';
import cors from "cors"
import analysisRouter from "./routes/analysis.route.js"
import performanceTrendRouter from "./routes/performance.route.js"
import performanceTrendGraphRouter from "./routes/performanceGraph.route.js"
import mistakeRouter from "./routes/mistake.route.js"
import compareRouter from "./routes/compare.route.js"
import recommendedTopicsRouter from "./routes/recommended.route.js"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))


app.use("/analyze",analysisRouter)

app.use("/performance-trend",performanceTrendRouter)

app.use("/performance-trend-graph",performanceTrendGraphRouter)

app.use("/mistake-analysis",mistakeRouter)

app.use("/compare-performance",compareRouter)

app.use("/recommended-topics",recommendedTopicsRouter)

export { app }