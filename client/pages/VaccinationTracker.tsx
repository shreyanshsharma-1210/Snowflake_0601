import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScheduleSection } from "@/components/vaccination/ScheduleSection";
import { useToast } from "@/hooks/use-toast";
import type {
  FamilyMemberRecord,
  Gender,
  ReminderPayload,
  ReminderRecord,
  VaccinesResponse,
  VaccineRecommendation,
} from "@shared/api";

import { VaccineFacts } from "@/components/vaccination/VaccineFacts";
import { motion } from "framer-motion";

const fetchVaccinationSchedule = async (
  age: number,
  gender: Gender,
): Promise<VaccinesResponse> => {
  const params = new URLSearchParams({
    age: age.toString(),
    gender,
  });
  const response = await fetch(`/api/vaccines?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to load vaccination schedule.");
  }
  return (await response.json()) as VaccinesResponse;
};

const fetchFamilyMembers = async (): Promise<FamilyMemberRecord[]> => {
  const response = await fetch("/api/family");
  if (!response.ok) {
    throw new Error("Unable to load family members.");
  }
  return (await response.json()) as FamilyMemberRecord[];
};

const addFamilyMemberRequest = async (payload: {
  name: string;
  age: number;
  gender: Gender;
}): Promise<FamilyMemberRecord> => {
  const response = await fetch("/api/family", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to save family member.");
  }
  return (await response.json()) as FamilyMemberRecord;
};

const createReminderRequest = async (
  payload: ReminderPayload,
): Promise<ReminderRecord> => {
  const response = await fetch("/api/reminders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Unable to schedule reminder.");
  }
  return (await response.json()) as ReminderRecord;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") || "user";

type Mode = "personal" | "family";

interface PersonalScheduleProps {
  schedule: VaccinesResponse | null;
  isLoading: boolean;
  contextName?: string;
  onRemind: (vaccine: VaccineRecommendation) => void;
  isSavingReminder: boolean;
}

// Shared frosted glass card style used across this page
const frostedCardClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_30px_80px_rgba(59,130,246,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_36px_96px_rgba(59,130,246,0.24)]";

function PersonalSchedule({
  schedule,
  isLoading,
  contextName,
  onRemind,
  isSavingReminder,
}: PersonalScheduleProps) {
  if (isLoading) {
    return (
      <Card
        className={`${frostedCardClass} flex items-center justify-center py-12`}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating personalised vaccination plan...
        </div>
      </Card>
    );
  }

  if (!schedule) {
    return (
      <Card className={`${frostedCardClass}`}>
        <CardHeader>
          <CardTitle className="dashboard-title text-xl font-semibold tracking-tight">
            Your vaccination plan awaits
          </CardTitle>
          <CardDescription className="text-xs">
            Provide your age and gender to generate a tailored vaccination
            schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          We will highlight upcoming vaccines and those recommended within the
          past two years so you can stay on track.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ScheduleSection
        title="Upcoming Vaccines"
        vaccines={schedule.upcoming}
        onRemind={onRemind}
        contextLabel={contextName}
        emptyMessage="No upcoming vaccines at the moment."
        isSavingReminder={isSavingReminder}
        layout="carousel"
      />
      <ScheduleSection
        title="Past 2 Years"
        vaccines={schedule.recent}
        onRemind={onRemind}
        contextLabel={contextName}
        emptyMessage="No vaccines recorded in the last two years."
        isSavingReminder={isSavingReminder}
        layout="carousel"
      />
    </div>
  );
}

interface FamilyMemberScheduleProps {
  member: FamilyMemberRecord;
  onRemind: (
    vaccine: VaccineRecommendation,
    member: FamilyMemberRecord,
  ) => void;
  isSavingReminder: boolean;
}

function FamilyMemberSchedule({
  member,
  onRemind,
  isSavingReminder,
}: FamilyMemberScheduleProps) {
  const scheduleQuery = useQuery<VaccinesResponse, Error>({
    queryKey: ["vaccines", member.id, member.age, member.gender],
    queryFn: () => fetchVaccinationSchedule(member.age, member.gender),
  });

  if (scheduleQuery.isLoading) {
    return (
      <Card
        className={`${frostedCardClass} flex items-center justify-center py-12`}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing {member.name}'s vaccination plan...
        </div>
      </Card>
    );
  }

  if (scheduleQuery.isError || !scheduleQuery.data) {
    return (
      <Card className="rounded-3xl border border-red-200 bg-red-50/70">
        <CardHeader>
          <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
            Unable to load vaccines
          </CardTitle>
          <CardDescription className="text-xs">
            We could not load the schedule for {member.name}. Please try again
            later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const schedule = scheduleQuery.data;

  return (
    <div className="space-y-6">
      <ScheduleSection
        title="Upcoming Vaccines"
        vaccines={schedule.upcoming}
        onRemind={(vaccine) => onRemind(vaccine, member)}
        contextLabel={member.name}
        emptyMessage="Nothing upcoming right now."
        isSavingReminder={isSavingReminder}
        layout="carousel"
      />
      <ScheduleSection
        title="Past 2 Years"
        vaccines={schedule.recent}
        onRemind={(vaccine) => onRemind(vaccine, member)}
        contextLabel={member.name}
        emptyMessage="No vaccines recorded in the past two years."
        isSavingReminder={isSavingReminder}
        layout="carousel"
      />
    </div>
  );
}

export default function VaccinationTracker() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>("personal");

  const [personalForm, setPersonalForm] = useState<{
    name: string;
    age: string;
    gender: Gender;
  }>({
    name: "",
    age: "",
    gender: "any",
  });

  const [personalContext, setPersonalContext] = useState<{
    name: string;
    userId: string;
  } | null>(null);

  const [personalSchedule, setPersonalSchedule] =
    useState<VaccinesResponse | null>(null);

  const personalScheduleMutation = useMutation({
    mutationFn: ({ age, gender }: { age: number; gender: Gender }) =>
      fetchVaccinationSchedule(age, gender),
    onSuccess: (data) => {
      setPersonalSchedule(data);
    },
    onError: (error: unknown) => {
      toast({
        title: "Unable to generate schedule",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
        variant: "destructive",
      });
    },
  });

  const familyMembersQuery = useQuery<FamilyMemberRecord[], Error>({
    queryKey: ["family-members"],
    queryFn: fetchFamilyMembers,
  });

  const [familyForm, setFamilyForm] = useState<{
    name: string;
    age: string;
    gender: Gender;
  }>({
    name: "",
    age: "",
    gender: "any",
  });

  const addFamilyMemberMutation = useMutation({
    mutationFn: ({
      name,
      age,
      gender,
    }: {
      name: string;
      age: number;
      gender: Gender;
    }) => addFamilyMemberRequest({ name, age, gender }),
    onSuccess: (record) => {
      toast({
        title: "Family member added",
        description: `${record.name} has been added to your dashboard.`,
      });
      setFamilyForm({ name: "", age: "", gender: "any" });
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Unable to add member",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const reminderMutation = useMutation({
    mutationFn: createReminderRequest,
    onError: (error: unknown) => {
      toast({
        title: "Could not schedule reminder",
        description:
          error instanceof Error ? error.message : "Please try again shortly.",
        variant: "destructive",
      });
    },
  });

  const familyMembers = familyMembersQuery.data ?? [];
  const [activeFamilyMember, setActiveFamilyMember] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (familyMembers.length === 0) {
      setActiveFamilyMember(null);
      return;
    }
    setActiveFamilyMember((prev) => {
      if (prev && familyMembers.some((member) => member.id === prev)) {
        return prev;
      }
      return familyMembers[0]?.id ?? null;
    });
  }, [familyMembers]);

  const handlePersonalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAge = Number.parseFloat(personalForm.age);
    if (Number.isNaN(parsedAge) || parsedAge < 0) {
      toast({
        title: "Check the details",
        description:
          "Age must be a valid number greater than or equal to zero.",
        variant: "destructive",
      });
      return;
    }

    const trimmedName = personalForm.name.trim() || "You";
    const context = {
      name: trimmedName,
      userId: `personal-${slugify(trimmedName)}`,
    };
    setPersonalContext(context);
    personalScheduleMutation.mutate({
      age: parsedAge,
      gender: personalForm.gender,
    });
  };

  const handleAddFamilyMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAge = Number.parseFloat(familyForm.age);
    if (Number.isNaN(parsedAge) || parsedAge < 0) {
      toast({
        title: "Check the age",
        description:
          "Please provide a valid age before adding a family member.",
        variant: "destructive",
      });
      return;
    }
    const trimmedName = familyForm.name.trim();
    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Enter a member name to continue.",
        variant: "destructive",
      });
      return;
    }

    addFamilyMemberMutation.mutate({
      name: trimmedName,
      age: parsedAge,
      gender: familyForm.gender,
    });
  };

  const handlePersonalReminder = (vaccine: VaccineRecommendation) => {
    const context = personalContext ?? {
      name: personalForm.name.trim() || "You",
      userId: `personal-${slugify(personalForm.name || "user")}`,
    };

    reminderMutation.mutate(
      {
        userId: context.userId,
        vaccineId: vaccine.id,
        scheduledAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast({
            title: "Reminder scheduled",
            description: `${vaccine.vaccine} reminder saved for ${context.name}.`,
          });
        },
      },
    );
  };

  const handleFamilyReminder = (
    vaccine: VaccineRecommendation,
    member: FamilyMemberRecord,
  ) => {
    reminderMutation.mutate(
      {
        userId: `family-${slugify(member.name)}`,
        memberId: member.id,
        vaccineId: vaccine.id,
        scheduledAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast({
            title: "Reminder scheduled",
            description: `${vaccine.vaccine} reminder saved for ${member.name}.`,
          });
        },
      },
    );
  };

  const personalModeHeader = useMemo(
    () => (
      <div className="space-y-1">
        <h1 className="dashboard-title text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          Vaccination Tracker
        </h1>
        <p className="dashboard-text text-gray-600 text-base md:text-lg">
          Manage personal and family vaccination schedules in one organised
          place.
        </p>
      </div>
    ),
    [],
  );

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-white via-[#f8fbff] to-[#eef2ff]">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28`}
      >
        <div className="mx-auto w-full max-w-6xl px-6 pb-16">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {personalModeHeader}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Mode
              </span>
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as Mode)}
              >
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="family">Family</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </header>

          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsContent value="personal" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div
                  className="lg:col-span-4"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <VaccineFacts />
                  <div className="relative mt-5 flex flex-col pb-7 overflow-hidden rounded-3xl">
                    <img
                      loading="lazy"
                      srcSet="https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=100 100w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=200 200w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=400 400w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=800 800w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=1200 1200w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=1600 1600w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434&width=2000 2000w, https://cdn.builder.io/o/assets%2F8db721cb8f564b0b9c83e7cfbd23c434%2F708844e4c827412d867c3845974444f5?alt=media&token=ca81b097-4159-46f2-b432-d80317c2d919&apiKey=8db721cb8f564b0b9c83e7cfbd23c434"
                      alt=""
                      className="mt-5 aspect-[1.49] w-full min-h-[20px] min-w-[20px] overflow-hidden rounded-3xl border border-white object-cover object-center"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="lg:col-span-8"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <Card className={`${frostedCardClass}`}>
                    <CardHeader>
                      <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                        Personal Details
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Enter your information to generate a personalised
                        vaccination schedule.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        className="space-y-4"
                        onSubmit={handlePersonalSubmit}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="personal-name" className="text-xs">
                            Name
                          </Label>
                          <Input
                            id="personal-name"
                            value={personalForm.name}
                            onChange={(event) =>
                              setPersonalForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            placeholder="e.g. Riya Sharma"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="personal-age" className="text-xs">
                            Age (years)
                          </Label>
                          <Input
                            id="personal-age"
                            type="number"
                            min={0}
                            step={0.1}
                            value={personalForm.age}
                            onChange={(event) =>
                              setPersonalForm((prev) => ({
                                ...prev,
                                age: event.target.value,
                              }))
                            }
                            placeholder="e.g. 4 or 0.5"
                            className="h-9 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Gender</Label>
                          <Select
                            value={personalForm.gender}
                            onValueChange={(value) =>
                              setPersonalForm((prev) => ({
                                ...prev,
                                gender: value as Gender,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">
                                Any / Prefer not to say
                              </SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          type="submit"
                          className="w-full"
                          disabled={personalScheduleMutation.isPending}
                        >
                          {personalScheduleMutation.isPending
                            ? "Generating..."
                            : "Generate Schedule"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  className="lg:col-span-12"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card className={`${frostedCardClass}`}>
                    <CardHeader>
                      <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                        Your Plan
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Upcoming and recent vaccines tailored to you.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PersonalSchedule
                        schedule={personalSchedule}
                        isLoading={personalScheduleMutation.isPending}
                        contextName={personalContext?.name}
                        onRemind={handlePersonalReminder}
                        isSavingReminder={reminderMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="family" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div
                  className="lg:col-span-4"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <VaccineFacts />
                </motion.div>
                <motion.div
                  className="lg:col-span-8"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className={`${frostedCardClass}`}>
                      <CardHeader>
                        <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                          Add Family Member
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Track vaccinations for everyone in your family. Add
                          each member to view their tailored schedule.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form
                          className="space-y-4"
                          onSubmit={handleAddFamilyMember}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="family-name" className="text-xs">
                              Name
                            </Label>
                            <Input
                              id="family-name"
                              value={familyForm.name}
                              onChange={(event) =>
                                setFamilyForm((prev) => ({
                                  ...prev,
                                  name: event.target.value,
                                }))
                              }
                              placeholder="e.g. Aarav"
                              className="h-9 text-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="family-age" className="text-xs">
                              Age (years)
                            </Label>
                            <Input
                              id="family-age"
                              type="number"
                              min={0}
                              step={0.1}
                              value={familyForm.age}
                              onChange={(event) =>
                                setFamilyForm((prev) => ({
                                  ...prev,
                                  age: event.target.value,
                                }))
                              }
                              placeholder="e.g. 11"
                              className="h-9 text-sm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Gender</Label>
                            <Select
                              value={familyForm.gender}
                              onValueChange={(value) =>
                                setFamilyForm((prev) => ({
                                  ...prev,
                                  gender: value as Gender,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="any">
                                  Any / Prefer not to say
                                </SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            size="sm"
                            type="submit"
                            className="w-full"
                            disabled={addFamilyMemberMutation.isPending}
                          >
                            {addFamilyMemberMutation.isPending
                              ? "Adding..."
                              : "Add Member"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card className={`${frostedCardClass}`}>
                      <CardHeader>
                        <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                          Family overview
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Add each family member to compare upcoming vaccines
                          and ensure nobody misses an important dose.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Once added, each member appears in the dashboard below
                        with personalised upcoming and recent vaccines.
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>

              <div>
                {familyMembersQuery.isLoading ? (
                  <Card
                    className={`${frostedCardClass} flex items-center justify-center py-12`}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading family dashboard...
                    </div>
                  </Card>
                ) : familyMembersQuery.isError ? (
                  <Card className="rounded-3xl border border-red-200 bg-red-50/70">
                    <CardHeader>
                      <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                        Unable to load family members
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Please refresh the page to try again.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : familyMembers.length === 0 ? (
                  <Card className={`${frostedCardClass}`}>
                    <CardHeader>
                      <CardTitle className="dashboard-title text-lg font-semibold tracking-tight">
                        No family members yet
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Add your loved ones to manage everyone’s vaccinations in
                        one place.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <Tabs
                    value={activeFamilyMember ?? undefined}
                    onValueChange={setActiveFamilyMember}
                  >
                    <TabsList className="flex flex-wrap">
                      {familyMembers.map((member) => (
                        <TabsTrigger
                          key={member.id}
                          value={member.id}
                          className="capitalize"
                        >
                          {member.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {familyMembers.map((member) => (
                      <TabsContent
                        key={member.id}
                        value={member.id}
                        className="mt-6 space-y-6"
                      >
                        <FamilyMemberSchedule
                          member={member}
                          onRemind={handleFamilyReminder}
                          isSavingReminder={reminderMutation.isPending}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
