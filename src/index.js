import dotenv from "dotenv" //for future use
import connectDB from "./db/index.js"; // for future use
import { app } from './app.js'

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`);
});