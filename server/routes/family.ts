import type { RequestHandler } from "express";
import { FamilyMemberPayload, FamilyMemberRecord, Gender } from "@shared/api";

const familyMembers: FamilyMemberRecord[] = [];

function normalizeGender(value: Gender | string): Gender {
  const gender = typeof value === "string" ? value.trim().toLowerCase() : value;
  if (gender === "male" || gender === "m") return "male";
  if (gender === "female" || gender === "f") return "female";
  return "any";
}

export const listFamilyMembers: RequestHandler = (_req, res) => {
  res.json(familyMembers);
};

export const createFamilyMember: RequestHandler = (req, res) => {
  const payload = req.body as Partial<FamilyMemberPayload> | undefined;

  if (
    !payload ||
    typeof payload.name !== "string" ||
    payload.name.trim() === ""
  ) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const age =
    typeof payload.age === "number" ? payload.age : Number(payload.age);
  if (Number.isNaN(age) || age < 0) {
    res.status(400).json({ error: "age must be a positive number" });
    return;
  }

  const gender = normalizeGender(payload.gender ?? "any");

  const record: FamilyMemberRecord = {
    id: `member-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    name: payload.name.trim(),
    age,
    gender,
    createdAt: new Date().toISOString(),
  };

  familyMembers.push(record);

  res.status(201).json(record);
};
