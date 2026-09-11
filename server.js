import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { connectDB } from "./DB/db.js";
import problemRoutes from "./routes/problem.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/problems", problemRoutes);
app.use("/api/attempts", attemptRoutes);

// Basic error handler — catches anything thrown in a controller (e.g. a
// Groq API failure) and returns a clean 500 instead of crashing the process.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App is running successfully on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    });

export default app;