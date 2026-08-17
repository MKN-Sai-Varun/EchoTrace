export function getClientTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatClientTime(dateValue: string | Date, timeZone = getClientTimeZone()): string {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
}
