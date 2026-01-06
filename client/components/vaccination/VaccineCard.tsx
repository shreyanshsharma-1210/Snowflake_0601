import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Bell, Loader2, Calendar, MessageSquare, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaccineRecommendation } from "@shared/api";

const severityConfig = {
  critical: {
    label: "Critical 🔴",
    badgeClass: "border-red-200 bg-red-100 text-red-700",
  },
  moderate: {
    label: "Moderate 🟠",
    badgeClass: "border-orange-200 bg-orange-100 text-orange-700",
  },
  low: {
    label: "Low 🟢",
    badgeClass: "border-green-200 bg-green-100 text-green-700",
  },
} as const;

interface VaccineCardProps {
  vaccine: VaccineRecommendation;
  onRemind: (vaccine: VaccineRecommendation) => void;
  contextLabel?: string;
  isSavingReminder?: boolean;
}

const formatAge = (age: number) => {
  if (age < 1) {
    const months = Math.round(age * 12);
    if (months <= 1) {
      return "Newborn";
    }
    return `${months} months`;
  }
  if (Number.isInteger(age)) {
    return `${age} years`;
  }
  return `${age.toFixed(1)} years`;
};

const glassCardClass =
  "rounded-3xl border border-white/45 bg-gradient-to-br from-white/85 via-white/50 to-white/25 backdrop-blur-xl shadow-[0_24px_64px_rgba(79,70,229,0.16)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_76px_rgba(79,70,229,0.22)] min-w-0 overflow-hidden";

export function VaccineCard({
  vaccine,
  onRemind,
  contextLabel,
  isSavingReminder = false,
}: VaccineCardProps) {
  const severity = severityConfig[vaccine.severity];
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState({
    date: '',
    time: '',
    email: '',
    message: `Reminder: ${vaccine.vaccine} vaccination for ${contextLabel || 'you'}`,
  });

  // Webhook function to send vaccination reminder data
  const sendVaccinationReminderWebhook = async (webhookData: {
    name: string;
    date: string;
    time: string;
    email: string;
    message: string;
  }) => {
    try {
      const response = await fetch('https://hook.eu2.make.com/de2h4yf3tpu4eq10r4a8pwkbmgrdbjva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });
      
      if (!response.ok) {
        console.warn('Webhook request failed:', response.statusText);
      }
    } catch (error) {
      console.warn('Webhook request error:', error);
    }
  };

  const handleReminderSubmit = async () => {
    // Prepare webhook data
    const webhookData = {
      name: contextLabel || 'You',
      date: reminderData.date,
      time: reminderData.time,
      email: reminderData.email,
      message: reminderData.message,
    };

    // Send webhook (don't wait for it to complete to avoid blocking the UI)
    sendVaccinationReminderWebhook(webhookData);

    // Call the original onRemind function
    onRemind(vaccine);
    
    // Close the modal
    setIsReminderModalOpen(false);
    
    // Reset form
    setReminderData({
      date: '',
      time: '',
      email: '',
      message: `Reminder: ${vaccine.vaccine} vaccination for ${contextLabel || 'you'}`,
    });
  };


  return (
    <Dialog>
      <Card
        className={cn(glassCardClass, "flex h-full flex-col justify-between")}
      >
        <CardHeader className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="dashboard-title text-base md:text-lg font-semibold leading-tight tracking-tight break-words text-foreground">
              {vaccine.vaccine}
            </CardTitle>
            <Badge className={severity.badgeClass}>{severity.label}</Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Protects against{" "}
            <span className="font-medium text-foreground">
              {vaccine.disease}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 p-4 pt-0">
          <div className="rounded-xl border border-white/40 bg-white/35 p-2 text-xs text-muted-foreground shadow-inner shadow-white/30">
            <div className="font-semibold text-foreground">Recommended at</div>
            <div>{formatAge(vaccine.age)}</div>
            {contextLabel ? (
              <div className="mt-1 text-xs">
                Tailored for{" "}
                <span className="font-medium text-foreground">
                  {contextLabel}
                </span>
              </div>
            ) : null}
          </div>
          {vaccine.notes ? (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes:</span>{" "}
              {vaccine.notes}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                View details
              </Button>
            </DialogTrigger>
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => setIsReminderModalOpen(true)}
              disabled={isSavingReminder}
            >
              {isSavingReminder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-1" />
                  Remind Me
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/90 via-white/55 to-white/30 backdrop-blur-2xl shadow-[0_40px_90px_rgba(79,70,229,0.28)] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="dashboard-title text-base md:text-lg leading-tight break-words">
            {vaccine.vaccine}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the {vaccine.vaccine} vaccine.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">
              Disease prevented:
            </span>{" "}
            {vaccine.disease}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Severity:</span>
            <Badge className={severity.badgeClass}>{severity.label}</Badge>
          </div>
          <div>
            <span className="font-semibold text-foreground">
              Recommended age:
            </span>{" "}
            {formatAge(vaccine.age)}
          </div>
          {vaccine.notes ? (
            <div>
              <span className="font-semibold text-foreground">Guidance:</span>{" "}
              {vaccine.notes}
            </div>
          ) : null}
          {contextLabel ? (
            <div>
              <span className="font-semibold text-foreground">Applies to:</span>{" "}
              {contextLabel}
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={() => setIsReminderModalOpen(true)} disabled={isSavingReminder}>
            {isSavingReminder ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Remind Me
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      {/* Reminder Modal */}
      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent className="rounded-3xl border border-white/40 bg-gradient-to-br from-white/90 via-white/55 to-white/30 backdrop-blur-2xl shadow-[0_40px_90px_rgba(79,70,229,0.28)] p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="w-5 h-5 text-blue-600" />
              Set Vaccination Reminder
            </DialogTitle>
            <DialogDescription>
              Schedule a reminder for {vaccine.vaccine} vaccination
              {contextLabel && ` for ${contextLabel}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="reminder-date" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                Reminder Date
              </Label>
              <Input
                id="reminder-date"
                type="date"
                value={reminderData.date}
                onChange={(e) => setReminderData(prev => ({ ...prev, date: e.target.value }))}
                className="rounded-xl border-white/40 bg-white/50 backdrop-blur"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Reminder Time
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderData.time}
                onChange={(e) => setReminderData(prev => ({ ...prev, time: e.target.value }))}
                className="rounded-xl border-white/40 bg-white/50 backdrop-blur"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="reminder-email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="reminder-email"
                type="email"
                value={reminderData.email}
                onChange={(e) => setReminderData(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-xl border-white/40 bg-white/50 backdrop-blur"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="reminder-message" className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Reminder Message
              </Label>
              <Textarea
                id="reminder-message"
                value={reminderData.message}
                onChange={(e) => setReminderData(prev => ({ ...prev, message: e.target.value }))}
                className="rounded-xl border-white/40 bg-white/50 backdrop-blur resize-none"
                rows={3}
                placeholder="Enter your reminder message..."
              />
            </div>

            {/* Vaccine Info Summary */}
            <div className="rounded-xl border border-white/40 bg-white/35 p-3 text-sm">
              <div className="font-semibold text-foreground mb-1">Vaccination Details:</div>
              <div className="text-muted-foreground">
                <div>• Vaccine: {vaccine.vaccine}</div>
                <div>• Protects against: {vaccine.disease}</div>
                <div>• Recommended at: {formatAge(vaccine.age)}</div>
                {contextLabel && <div>• For: {contextLabel}</div>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsReminderModalOpen(false)}
              className="flex-1 rounded-xl"
              disabled={isSavingReminder}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReminderSubmit}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
              disabled={isSavingReminder || !reminderData.date || !reminderData.time || !reminderData.email}
            >
              {isSavingReminder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminder
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
