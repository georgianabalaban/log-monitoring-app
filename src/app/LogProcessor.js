import fs from "fs";
import readline from "readline";
import path from "path";
import { __dirname } from "../utils/pathUtils.js";
import { parseTimeToSeconds, formatDuration } from "../utils/timeUtils.js";
import { WARNING_THRESHOLD, ERROR_THRESHOLD } from "../config/thresholds.js";

const logFilePath = path.join(__dirname, "../../logs.log");
const outputFilePath = path.join(__dirname, "../../log_report.txt");

export class LogProcessor {
  constructor() {
    this.startTimes = {};
    this.endTimes = {};
  }

  async processLogFile() {
    try {
      const fileStream = fs.createReadStream(logFilePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        this.processLogLine(line);
      }

      this.generateReport();
    } catch (err) {
      console.error("Error processing log file:", err);
    }
  }

  processLogLine(line) {
    const [timestamp, description, event, pid] = line
      .split(",")
      .map((s) => s.trim());
    const timeInSec = parseTimeToSeconds(timestamp);

    if (event === "START") {
      this.startTimes = { pid: { time: timeInSec, description } };
    } else if (event === "END") {
      this.endTimes = { pid: timeInSec };
    }
  }
}
