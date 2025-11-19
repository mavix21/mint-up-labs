export interface EventTimes {
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
}

/**
 * Calculate one hour after a given time
 * @param time - Time string in HH:mm format
 * @returns End time in HH:mm format
 */
export function calculateOneHourAfter(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const endHour = (hours + 1) % 24;
  return `${endHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Calculate the closest 30-minute interval to the current time
 * @returns EventTimes object with start and end times and dates
 */
export function calculateDefaultEventTimes(): EventTimes {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Round to next 30-minute interval
  let roundedMinute: number;
  let adjustedHour: number;

  if (currentMinute < 30) {
    // Round to next 30-minute mark (e.g., 7:15 → 7:30, 7:45 → 8:00)
    roundedMinute = 30;
    adjustedHour = currentHour;
  } else {
    // Round to next hour (e.g., 7:45 → 8:00, 8:15 → 8:30)
    roundedMinute = 0;
    adjustedHour = (currentHour + 1) % 24;
  }

  // Format start time (HH:mm)
  const startTime = `${adjustedHour.toString().padStart(2, "0")}:${roundedMinute
    .toString()
    .padStart(2, "0")}`;

  // Calculate end time
  const endTime = calculateOneHourAfter(startTime);

  // Determine dates
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  // If start time is 00:xx (midnight), use tomorrow's date
  const startDate = adjustedHour === 0 ? tomorrow : today;

  // If end time is 00:xx (midnight), use tomorrow's date
  const endDate = endTime.startsWith("00:") ? tomorrow : startDate;

  return { startTime, endTime, startDate, endDate };
}

/**
 * Get today's date in YYYY-MM-DD format for HTML date inputs
 * @returns Today's date as a string
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get tomorrow's date in YYYY-MM-DD format for HTML date inputs
 * @returns Tomorrow's date as a string
 */
export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a time string to HH:mm format
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @returns Formatted time string
 */
export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Check if an event is currently live
 * @param startDate - Event start timestamp
 * @param endDate - Optional event end timestamp
 * @returns boolean indicating if event is currently live
 */
export const isEventLive = (startDate: number, endDate?: number): boolean => {
  const now = Date.now();

  // If endDate exists, use it; otherwise, assume 24 hours duration
  const endTime = endDate || startDate + 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  return now >= startDate && now <= endTime;
};
