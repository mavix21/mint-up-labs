export interface ClientTimezone {
  name: string;
  offset: string;
  city: string;
}

/**
 * Get the client's timezone information
 * @returns ClientTimezone object with name, offset, and city
 */
export function getClientTimezone(): ClientTimezone {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";
    const offsetString = `${sign}${offsetHours.toString().padStart(2, "0")}:${offsetMinutes
      .toString()
      .padStart(2, "0")}`;

    return {
      name: timezone,
      offset: offsetString,
      city: timezone.split("/").pop()?.replace("_", " ") || timezone,
    };
  } catch (error) {
    // Fallback to UTC
    return {
      name: "UTC",
      offset: "+00:00",
      city: "UTC",
    };
  }
}
