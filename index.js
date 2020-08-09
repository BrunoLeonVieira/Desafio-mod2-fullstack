import express from "express";
import grades from "./Routers/grades.js";
import winston from "winston";

global.filename = "grades.json";

const { combine, timestamp, label, printf } = winston.format;
const format_log = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logger-api.log" }),
  ],
  format: combine(label({ label: "api-grandes" }), timestamp(), format_log),
});

const app = express();
app.use(express.json());

app.use("/grades", grades);

app.listen(8080, () => {
  logger.info("API Started!");
});
