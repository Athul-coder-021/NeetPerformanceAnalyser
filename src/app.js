import express from 'express';
import cors from "cors"
import analysisRouter from "./routes/analysis.route.js"
import performanceTrendRouter from "./routes/performance.route.js"
import performanceTrendGraphRouter from "./routes/performanceGraph.route.js"

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

// app.use("/mistake-analysis",mistakeRouter)

export { app }