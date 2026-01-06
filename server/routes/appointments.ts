import { RequestHandler } from "express";
import type { AppointmentPayload, AppointmentRecord } from "@shared/api";

const APPOINTMENTS: AppointmentRecord[] = [];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function createMeetingLink(id: string) {
  return `https://meet.healthsaarthi.example/${id}`;
}

export const createAppointment: RequestHandler = (req, res) => {
  const payload = req.body as AppointmentPayload;
  if (!payload?.doctor_id || !payload?.slot || !payload?.user_email || !payload?.user_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const id = generateId();
  const record: AppointmentRecord = {
    ...payload,
    id,
    createdAt: new Date().toISOString(),
    meetingLink: createMeetingLink(id),
  };

  // Persist (in-memory for now). Replace with DB (Firebase/MySQL) integration later.
  APPOINTMENTS.push(record);

  // Placeholder for sending email with meeting link (integration-ready)
  // e.g., enqueue job to SendGrid/Nodemailer with record.meetingLink

  res.status(201).json(record);
};

export const listAppointments: RequestHandler = (_req, res) => {
  res.json({ appointments: APPOINTMENTS });
};
