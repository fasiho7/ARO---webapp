const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ].filter(Boolean),
);

app.use(express.json({ limit: "80kb" }));
app.use(express.urlencoded({ extended: true, limit: "80kb" }));
app.use(cookieParser());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      // Allow exact matches in allowedOrigins OR any Vercel domain
      const isVercelDomain = /\.vercel\.app$/.test(origin);
      if (allowedOrigins.has(origin) || isVercelDomain) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;