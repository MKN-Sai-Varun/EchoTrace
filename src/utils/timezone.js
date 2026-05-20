const FALLBACK_TZ = "UTC";

/** @param {string | undefined | null} timeZone */
export function resolveTimeZone(timeZone) {
  if (!timeZone || typeof timeZone !== "string") return FALLBACK_TZ;
  const tz = timeZone.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return FALLBACK_TZ;
  }
}

/** @param {Date | string | number} date @param {string} timeZone */
export function formatTimeInZone(date, timeZone) {
  return new Date(date).toLocaleTimeString("en-US", {
    timeZone: resolveTimeZone(timeZone),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Full context line for AI prompts */
export function formatDateTimeContext(date, timeZone) {
  const tz = resolveTimeZone(timeZone);
  return new Date(date).toLocaleString("en-US", {
    timeZone: tz,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

/** @param {number} utcMs @param {string} timeZone */
function getZonedParts(utcMs, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: resolveTimeZone(timeZone),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date(utcMs))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/**
 * UTC instant for a wall-clock time on a calendar day in an IANA timezone.
 * @param {string} dateKey YYYY-MM-DD
 */
function utcForZonedWallTime(dateKey, hour, minute, second, ms, timeZone) {
  const [y, m, d] = dateKey.split("-").map(Number);
  let estimate = Date.UTC(y, m - 1, d, hour, minute, second, ms);

  for (let i = 0; i < 12; i++) {
    const z = getZonedParts(estimate, timeZone);
    const targetMs = Date.UTC(y, m - 1, d, hour, minute, second, ms);
    const actualMs = Date.UTC(z.year, z.month - 1, z.day, z.hour, z.minute, z.second, 0);
    const delta = targetMs - actualMs;
    if (delta === 0) break;
    estimate += delta;
  }

  return new Date(estimate);
}

/** Start/end of "today" in the user's timezone (for Mongo queries). */
export function getTodayBoundsInZone(timeZone) {
  const tz = resolveTimeZone(timeZone);
  const dateKey = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const start = utcForZonedWallTime(dateKey, 0, 0, 0, 0, tz);
  const end = utcForZonedWallTime(dateKey, 23, 59, 59, 999, tz);
  return { start, end, dateKey, timeZone: tz };
}
