import type { RequestHandler } from "express";
import { Gender, VaccinesResponse } from "@shared/api";
import { vaccinationSchedule } from "../data/vaccines";

function normalizeGenderParam(value: unknown): Gender {
  if (typeof value !== "string") {
    return "any";
  }
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "male" || normalized === "m") return "male";
  if (normalized === "female" || normalized === "f") return "female";
  return "any";
}

function matchesGender(entryGender: Gender, targetGender: Gender) {
  return (
    entryGender === "any" ||
    targetGender === "any" ||
    entryGender === targetGender
  );
}

export const handleVaccines: RequestHandler = (req, res) => {
  const ageParam = Array.isArray(req.query.age)
    ? req.query.age[0]
    : req.query.age;
  const genderParam = Array.isArray(req.query.gender)
    ? req.query.gender[0]
    : req.query.gender;

  const age = ageParam ? Number.parseFloat(String(ageParam)) : Number.NaN;
  if (Number.isNaN(age) || age < 0) {
    console.error("Invalid age provided:", ageParam);
    res.status(400).json({ error: "Invalid age provided" });
    return;
  }

  const gender = normalizeGenderParam(genderParam);
  console.log(`Processing vaccines request: age=${age}, gender=${gender}`);

  const eligible = vaccinationSchedule.filter((entry) =>
    matchesGender(entry.gender, gender),
  );
  console.log(`Found ${eligible.length} eligible vaccines`);

  const upcoming = eligible
    .filter((entry) => entry.age >= age)
    .sort((a, b) => a.age - b.age);

  const recent = eligible
    .filter((entry) => entry.age < age && entry.age >= Math.max(0, age - 2))
    .sort((a, b) => b.age - a.age);

  console.log(`Upcoming: ${upcoming.length}, Recent: ${recent.length}`);

  const response: VaccinesResponse = {
    upcoming,
    recent,
  };

  res.json(response);
};
