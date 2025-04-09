import fs from "fs";
import readline from "readline";
import path from "path";
import { __dirname } from "../utils/pathUtils.js";
import { parseTimeToSeconds, formatDuration } from "../utils/timeUtils.js";
import { WARNING_THRESHOLD, ERROR_THRESHOLD } from "../utils/thresholds.js";

const logFilePath = path.join(__dirname, "../../logs.log");
const outputFilePath = path.join(__dirname, "../../log_report.txt");

export class LogProcessor {
  constructor() {
    this.startTimes = new Map();
    this.endTimes = new Map();
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
      this.startTimes.set(pid, { time: timeInSec, description });
    } else if (event === "END") {
      this.endTimes.set(pid, timeInSec);
    }
  }

  generateReport() {
    const outputLines = ["--- Log Report ---"];

    for (const [
      pid,
      { time: startTime, description },
    ] of this.startTimes.entries()) {
      if (!this.endTimes.has(pid)) continue;

      const endTime = this.endTimes.get(pid);
      const duration = endTime - startTime;
      const status = this.getLogStatus(duration);
      const durationStr = formatDuration(duration);

      const logLine = `[${status}] PID ${pid} | ${description} | Duration: ${durationStr}`;
      outputLines.push(logLine);
    }

    this.writeReport(outputLines);
  }

  getLogStatus(duration) {
    if (duration > ERROR_THRESHOLD) return "ERROR";
    if (duration > WARNING_THRESHOLD) return "WARNING";
    return "OK";
  }

  writeReport(lines) {
    try {
      fs.writeFileSync(outputFilePath, lines.join("\n"), "utf-8");
      console.log(`\nReport written to ${outputFilePath}`);
    } catch (err) {
      console.error("Error writing report:", err);
    }
  }
}
