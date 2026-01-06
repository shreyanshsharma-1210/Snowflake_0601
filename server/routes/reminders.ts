import type { RequestHandler } from "express";
import { ReminderPayload, ReminderRecord } from "@shared/api";

const reminders: ReminderRecord[] = [];

export const listReminders: RequestHandler = (req, res) => {
  const userIdParam = Array.isArray(req.query.userId)
    ? req.query.userId[0]
    : req.query.userId;
  const memberIdParam = Array.isArray(req.query.memberId)
    ? req.query.memberId[0]
    : req.query.memberId;

  const filtered = reminders.filter((reminder) => {
    if (userIdParam && reminder.userId !== userIdParam) {
      return false;
    }
    if (memberIdParam && reminder.memberId !== memberIdParam) {
      return false;
    }
    return true;
  });

  res.json(filtered);
};

export const createReminder: RequestHandler = (req, res) => {
  const payload: ReminderPayload = req.body;

  if (
    !payload ||
    typeof payload.userId !== "string" ||
    payload.userId.trim() === ""
  ) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  if (!payload.vaccineId || typeof payload.vaccineId !== "string") {
    res.status(400).json({ error: "vaccineId is required" });
    return;
  }

  const now = new Date().toISOString();

  const record: ReminderRecord = {
    id: `reminder-${Date.now()}`,
    userId: payload.userId,
    memberId: payload.memberId,
    vaccineId: payload.vaccineId,
    scheduledAt: payload.scheduledAt ?? now,
    createdAt: now,
  };

  reminders.push(record);

  res.status(201).json(record);
};
