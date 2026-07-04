"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  changePlanAction,
  type BillingDetails,
} from "@/app/dashboard/billing/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS } from "@/lib/billing/plans";
import type { PlanId } from "@/types/database";

/**
 * iyzico subscription checkout: collect the customer details iyzico requires,
 * then inject the returned checkout-form content (iyzico renders its own
 * PCI-compliant card form + installment options). On success iyzico posts back
 * to /api/iyzico/callback which applies the plan.
 */
export function IyzicoCheckout({ planId }: { planId: PlanId }) {
  const plan = PLANS[planId];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formInjected, setFormInjected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<BillingDetails>({
    name: "",
    surname: "",
    gsmNumber: "",
    identityNumber: "",
    city: "",
    country: "Türkiye",
    address: "",
  });

  function set<K extends keyof BillingDetails>(key: K, value: string) {
    setDetails((d) => ({ ...d, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await changePlanAction(planId, details);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.data.iyzicoFormContent) {
      setFormInjected(true);
      // Inject iyzico's embed content (a container div + a script that renders
      // the hosted card form). Scripts added via innerHTML don't execute, so we
      // re-create each script element for the browser to run it.
      const host = containerRef.current;
      if (host) {
        host.innerHTML = res.data.iyzicoFormContent;
        host.querySelectorAll("script").forEach((old) => {
          const s = document.createElement("script");
          for (const attr of old.attributes) s.setAttribute(attr.name, attr.value);
          s.text = old.text;
          old.replaceWith(s);
        });
      }
    }
  }

  if (formInjected) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Complete your payment below to activate the {plan.name} plan.
        </p>
        {/* iyzico renders its secure card form into this container. */}
        <div ref={containerRef} id="iyzipay-checkout-form" className="responsive" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Subscribe to <span className="font-medium text-foreground">{plan.name}</span>{" "}
        ({plan.price}
        {plan.cadence}). Payment is processed securely by iyzico — card details
        never touch our servers.
      </p>
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ad / First name" value={details.name} onChange={(v) => set("name", v)} required />
        <Field label="Soyad / Surname" value={details.surname} onChange={(v) => set("surname", v)} required />
        <Field label="Telefon / Phone" value={details.gsmNumber} onChange={(v) => set("gsmNumber", v)} placeholder="+90..." required />
        <Field label="TC Kimlik No / ID number" value={details.identityNumber} onChange={(v) => set("identityNumber", v)} required />
        <Field label="Şehir / City" value={details.city} onChange={(v) => set("city", v)} required />
        <Field label="Ülke / Country" value={details.country} onChange={(v) => set("country", v)} required />
      </div>
      <Field label="Adres / Address" value={details.address} onChange={(v) => set("address", v)} required />
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue to payment
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
