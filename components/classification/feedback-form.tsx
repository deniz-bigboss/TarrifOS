"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageSquarePlus } from "lucide-react";
import { submitFeedbackAction } from "@/app/dashboard/classifications/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackLabelRow } from "@/types/database";

type Tri = "yes" | "no" | "";

interface FeedbackFormProps {
  requestId: string;
  existing: FeedbackLabelRow | null;
}

export function FeedbackForm({ requestId, existing }: FeedbackFormProps) {
  const [wasCorrect, setWasCorrect] = useState<Tri>(triFrom(existing?.was_correct));
  const [actualCode, setActualCode] = useState(existing?.actual_code ?? "");
  const [brokerNotes, setBrokerNotes] = useState(existing?.broker_notes ?? "");
  const [shipmentCleared, setShipmentCleared] = useState<Tri>(triFrom(existing?.shipment_cleared));
  const [delayOccurred, setDelayOccurred] = useState<Tri>(triFrom(existing?.delay_occurred));
  const [penaltyOccurred, setPenaltyOccurred] = useState<Tri>(triFrom(existing?.penalty_occurred));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(existing));
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await submitFeedbackAction(requestId, {
      was_correct: triToBool(wasCorrect),
      actual_code: actualCode || undefined,
      broker_notes: brokerNotes || undefined,
      shipment_cleared: triToBool(shipmentCleared),
      delay_occurred: triToBool(delayOccurred),
      penalty_occurred: triToBool(penaltyOccurred),
    });
    if (res.ok) {
      setSaved(true);
    } else {
      setError(res.error);
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquarePlus className="h-4 w-4 text-primary" />
          Broker / customs feedback
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Every correction improves TariffOS. Tell us what actually happened at
          the border.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <TriField
            label="Was this classification accepted by your broker / customs authority?"
            value={wasCorrect}
            onChange={setWasCorrect}
          />

          <div className="space-y-1.5">
            <Label htmlFor="actualCode">Correct code (if different)</Label>
            <Input
              id="actualCode"
              value={actualCode}
              onChange={(e) => setActualCode(e.target.value)}
              placeholder="e.g. 6109.10"
              className="font-mono"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TriField label="Shipment cleared?" value={shipmentCleared} onChange={setShipmentCleared} compact />
            <TriField label="Was there a delay?" value={delayOccurred} onChange={setDelayOccurred} compact />
            <TriField label="Penalty / document issue?" value={penaltyOccurred} onChange={setPenaltyOccurred} compact />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brokerNotes">Broker notes</Label>
            <Textarea
              id="brokerNotes"
              value={brokerNotes}
              onChange={(e) => setBrokerNotes(e.target.value)}
              placeholder="Any context from your broker or customs authority…"
              rows={3}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saved ? "Update feedback" : "Submit feedback"}
            </Button>
            {saved && !saving && (
              <span className="flex items-center gap-1 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TriField({
  label,
  value,
  onChange,
  compact,
}: {
  label: string;
  value: Tri;
  onChange: (v: Tri) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={compact ? "text-xs" : undefined}>{label}</Label>
      <div className="flex gap-2">
        {(["yes", "no"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={
              "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium capitalize transition-colors " +
              (value === opt
                ? opt === "yes"
                  ? "border-success bg-success/10 text-success"
                  : "border-destructive bg-destructive/10 text-destructive"
                : "border-input hover:bg-secondary")
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function triFrom(value: boolean | null | undefined): Tri {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function triToBool(value: Tri): boolean | undefined {
  if (value === "yes") return true;
  if (value === "no") return false;
  return undefined;
}
