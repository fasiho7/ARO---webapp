const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const apiRouter = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, "http://localhost:3000", "http://127.0.0.1:3000"].filter(
    Boolean,
  ),
);

app.use(express.json({ limit: "80kb" }));
app.use(express.urlencoded({ extended: true, limit: "80kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
