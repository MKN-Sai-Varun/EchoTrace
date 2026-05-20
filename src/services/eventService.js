import Event from "../models/Event.js";
import { getTodayBoundsInZone } from "../utils/timezone.js";

export async function createEvent(userId, data) {
  return Event.create({ ...data, userId });
}

export async function getTodayEvents(userId, timeZone) {
  const { start } = timeZone
    ? getTodayBoundsInZone(timeZone)
    : (() => {
        const s = new Date();
        s.setHours(0, 0, 0, 0);
        return { start: s };
      })();

  return Event.find({
    userId,
    timestamp: { $gte: start },
  }).sort({ timestamp: 1 });
}
