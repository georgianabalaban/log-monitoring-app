# Log Monitoring Application

A clean and modular solution for parsing a log file, tracking job durations, and flagging any processes that exceed performance thresholds.

This solution was implemented as part of a coding challenge with a 90-minute time constraint. Focus was placed on clean structure, readability, and solid problem-solving.

---

## Challenge Objectives

- Parse a CSV log file (`logs.log`)
- Track start and end times for each job (by PID)
- Calculate job duration from START to END
- Log a `WARNING` if a job exceeds 5 minutes

How It Works
Reads the logs.log file line-by-line.

Parses entries in the format:
HH:MM:SS, Description, START|END, PID

Maps START and END times using the job’s PID.

Calculates the duration between events.

Flags jobs that exceed defined thresholds:

> 5 min → WARNING

> 10 min → ERROR

Outputs a human-readable report to both the console and log_report.txt.

