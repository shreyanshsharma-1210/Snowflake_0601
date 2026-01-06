import { RequestHandler } from "express";
import type { DoctorRecord, DoctorCategory, DoctorsResponse } from "@shared/api";

const SAMPLE_DOCTORS: Record<DoctorCategory, DoctorRecord[]> = {
  pediatrician: [
    {
      id: "p1",
      name: "Dr. Kavita Nair",
      specialization: "pediatrician",
      experienceYears: 12,
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      bio: "Child health specialist with focus on preventive care.",
      slots: ["09:00 AM", "10:30 AM", "03:00 PM"],
    },
    {
      id: "p2",
      name: "Dr. Rohan Mehta",
      specialization: "pediatrician",
      experienceYears: 9,
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      bio: "Immunisation and growth tracking expert.",
      slots: ["11:00 AM", "01:30 PM", "05:00 PM"],
    },
  ],
  dermatologist: [
    {
      id: "d1",
      name: "Dr. Meera Sharma",
      specialization: "dermatologist",
      experienceYears: 10,
      avatarUrl: "https://i.pravatar.cc/150?img=32",
      bio: "Specialist in acne and hair loss treatments.",
      slots: ["10:00 AM", "12:00 PM", "04:30 PM"],
    },
    {
      id: "d2",
      name: "Dr. Arjun Chopra",
      specialization: "dermatologist",
      experienceYears: 14,
      avatarUrl: "https://i.pravatar.cc/150?img=28",
      bio: "Cosmetic dermatology and skin rejuvenation.",
      slots: ["09:30 AM", "02:00 PM", "06:00 PM"],
    },
  ],
  cardiologist: [
    {
      id: "c1",
      name: "Dr. Neha Verma",
      specialization: "cardiologist",
      experienceYears: 15,
      avatarUrl: "https://i.pravatar.cc/150?img=45",
      bio: "Preventive cardiology and lifestyle medicine.",
      slots: ["08:30 AM", "01:00 PM", "05:30 PM"],
    },
  ],
  "general-physician": [
    {
      id: "g1",
      name: "Dr. Sameer Kulkarni",
      specialization: "general-physician",
      experienceYears: 11,
      avatarUrl: "https://i.pravatar.cc/150?img=49",
      bio: "Primary care and chronic disease management.",
      slots: ["09:00 AM", "12:30 PM", "03:30 PM"],
    },
  ],
  gynecologist: [
    {
      id: "gy1",
      name: "Dr. Priya Iyer",
      specialization: "gynecologist",
      experienceYears: 13,
      avatarUrl: "https://i.pravatar.cc/150?img=39",
      bio: "Women's health and prenatal care.",
      slots: ["10:15 AM", "01:45 PM", "04:00 PM"],
    },
  ],
  orthopedic: [
    {
      id: "o1",
      name: "Dr. Ankit Gupta",
      specialization: "orthopedic",
      experienceYears: 8,
      avatarUrl: "https://i.pravatar.cc/150?img=15",
      bio: "Sports injuries and joint care.",
      slots: ["11:15 AM", "02:30 PM", "05:15 PM"],
    },
  ],
};

export const listDoctors: RequestHandler = (req, res) => {
  const raw = (req.query.category as string | undefined) ?? "";
  const category = raw.toLowerCase() as DoctorCategory;
  if (!raw || !(category in SAMPLE_DOCTORS)) {
    return res.status(400).json({ error: "Invalid or missing category" });
  }
  const response: DoctorsResponse = {
    category,
    doctors: SAMPLE_DOCTORS[category],
  };
  res.json(response);
};
