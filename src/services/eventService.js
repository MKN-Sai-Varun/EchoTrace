import Event from "../models/Event.js";

export async function createEvent(userId, data) {
  return Event.create({ ...data, userId });
}

export async function getTodayEvents(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return Event.find({
    userId,
    timestamp: { $gte: start }
  }).sort({ timestamp: 1 });
}
