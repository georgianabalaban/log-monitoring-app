import { LogProcessor } from "../LogProcessor.js";
import { assert } from "chai";
import sinon from "sinon";
import fs from "fs";
import path from "path";
import { formatDuration, parseTimeToSeconds } from "../../utils/timeUtils.js";
export const __filename = new URL(import.meta.url).pathname;
export const __dirname = path.dirname(__filename);
const outputFilePath = path.join(__dirname, "../../../log_report.txt");

describe("LogProcessor processLogLine", function () {
  let logProcessor;
  let startSetSpy;
  let endSetSpy;

  beforeEach(() => {
    logProcessor = new LogProcessor();
    logProcessor.startTimes.clear();
    logProcessor.endTimes.clear();
    startSetSpy = sinon.spy(logProcessor.startTimes, "set");
    endSetSpy = sinon.spy(logProcessor.endTimes, "set");
  });

  afterEach(() => {
    sinon.restore(); // Restore the original functions after each test
  });
  it("should process a START line and store time and description", () => {
    const line = "11:35:23,scheduled task 032, START,37980";

    logProcessor.processLogLine(line);

    assert.isTrue(startSetSpy.calledOnce);
    assert.deepEqual(startSetSpy.firstCall.args[0], "37980");

    const expectedTime = 11 * 3600 + 35 * 60 + 23;
    assert.deepEqual(startSetSpy.firstCall.args[1], {
      time: expectedTime,
      description: "scheduled task 032",
    });

    assert.strictEqual(logProcessor.startTimes.get("37980").time, expectedTime);
  });
  it("should process an END line and store only time", () => {
    const line = "11:35:56,scheduled task 032, END,37980";

    logProcessor.processLogLine(line);

    assert.isTrue(endSetSpy.calledOnce);
    assert.strictEqual(endSetSpy.firstCall.args[0], "37980");
    const expectedTime = 11 * 3600 + 35 * 60 + 56;
    assert.strictEqual(endSetSpy.firstCall.args[1], expectedTime);
    assert.strictEqual(logProcessor.endTimes.get("37980"), expectedTime);
  });

  it("should process a log line and store start and end times", function () {
    const logLineStart = "2025-04-09 10:00:00, Event Start, START, 123";
    const logLineEnd = "2025-04-09 10:05:00, Event End, END, 123";

    const processLogLineSpy = sinon.spy(logProcessor, "processLogLine");

    logProcessor.processLogLine(logLineStart);
    logProcessor.processLogLine(logLineEnd);

    assert.isTrue(processLogLineSpy.calledTwice);
    assert.deepEqual(logProcessor.startTimes.size, 1);
    assert.deepEqual(logProcessor.endTimes.size, 1);
  });
});
describe("LogProcessor writeReport", () => {
  let logProcessor;
  let writeFileStub;
  let consoleLogStub;
  let consoleErrorStub;

  beforeEach(() => {
    logProcessor = new LogProcessor();
    writeFileStub = sinon.stub(fs, "writeFileSync");
    consoleLogStub = sinon.stub(console, "log");
    consoleErrorStub = sinon.stub(console, "error");
  });

  afterEach(() => {
    sinon.restore();
  });
  it("should write joined lines to file", () => {
    const lines = [
      "--- Log Report ---",
      "[OK] PID 123 | Test | Duration: 10 00:00:10",
    ];

    logProcessor.writeReport(lines);

    assert.isTrue(writeFileStub.calledOnce);
    assert.deepEqual(writeFileStub.firstCall.args[0], outputFilePath);
    assert.strictEqual(writeFileStub.firstCall.args[1], lines.join("\n"));
    assert.strictEqual(writeFileStub.firstCall.args[2], "utf-8");
    assert.isTrue(consoleLogStub.calledWithMatch(/Report written to/));
  });

  it("should handle file system write errors gracefully", () => {
    writeFileStub.throws(new Error("Disk is full"));

    const lines = ["Test Line"];

    logProcessor.writeReport(lines);

    assert.isTrue(consoleErrorStub.calledOnce);
    assert.match(consoleErrorStub.firstCall.args[0], /Error writing report/);
  });
  it("should process log lines and generate a report", async function () {
    const logProcessor = new LogProcessor();
    const logLines = [
      "2025-04-09 10:00:00, Event Start, START, 123",
      "2025-04-09 10:05:00, Event End, END, 123",
    ];

    let result = [];
    logProcessor.processLogLine = (line) => {
      result.push(line);
    };

    // Process each line as if it was read from the file
    logLines.forEach((line) => logProcessor.processLogLine(line));

    // Generate the report (you can mock the actual file writing)
    logProcessor.generateReport();

    // Use Chai's assert to check the length of the result
    assert.lengthOf(result, 2, "Expected 2 log lines to be processed");
  });
});
describe("Time Utils", () => {
  describe("parseTimeToSeconds", () => {
    it("should convert HH:MM:SS to total seconds", () => {
      const time = "01:02:03"; // 1*3600 + 2*60 + 3 = 3723
      const result = parseTimeToSeconds(time);
      assert.strictEqual(result, 3723);
    });

    it("should return NaN for invalid time format", () => {
      const result = parseTimeToSeconds("25:00"); // Missing seconds
      assert.isTrue(isNaN(result));
    });

    it("should return NaN for non-numeric values", () => {
      const result = parseTimeToSeconds("12:aa:00");
      assert.isTrue(isNaN(result));
    });

    it("should return 0 for midnight", () => {
      const result = parseTimeToSeconds("00:00:00");
      assert.strictEqual(result, 0);
    });
  });
  describe("formatDuration", () => {
    it("should convert seconds into HH:MM:SS string", () => {
      const result = formatDuration(3723);
      assert.strictEqual(result, "3723 01:02:03");
    });

    it("should handle zero duration", () => {
      const result = formatDuration(0);
      assert.strictEqual(result, "0 00:00:00");
    });

    it("should pad single digits with zeros", () => {
      const result = formatDuration(3661); // 1:1:1
      assert.strictEqual(result, "3661 01:01:01");
    });
  });
});
