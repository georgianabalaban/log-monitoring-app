// Parses HH:MM:SS string into total seconds
export function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(":");
  if (parts.length !== 3) {
    console.error(`Invalid time format: ${timeStr}`);
    return NaN; // Return NaN if the format is incorrect
  }
  const [hours, minutes, seconds] = parts.map(Number);
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    console.error(`Invalid time components: ${timeStr}`);
    return NaN; // Return NaN if any component is invalid
  }
  return hours * 3600 + minutes * 60 + seconds;
}

// Formats seconds into HH:MM:SS string
export function formatDuration(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${seconds} ${h}:${m}:${s}`;
}
