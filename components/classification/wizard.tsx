"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { productInputSchema, type ProductInputSchema } from "@/lib/validation/schemas";
import { lookupProductAction } from "@/app/dashboard/classifications/actions";
import { classifyAction, type GuestClassification } from "@/app/classify/actions";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTRIES } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ALL_COUNTRY_OPTIONS, FREQUENT_LANES } from "@/lib/countries";
import { CURRENCIES } from "@/lib/currencies";
import { roadFeasible } from "@/lib/geo/transport-feasibility";
import type { Messages } from "@/lib/i18n/messages";

type WizardMessages = Messages["app"]["wizard"];

const QUICK_FIND_DEBOUNCE_MS = 700;

const FREQUENT_OPTIONS = Object.entries(COUNTRIES);
const OTHER_COUNTRY_OPTIONS = ALL_COUNTRY_OPTIONS.filter(
  ([code]) => !FREQUENT_LANES.includes(code),
);
const CATEGORIES = PRODUCT_CATEGORIES;

/** Grouped country <option>s: frequent lanes first, then everything else. */
function CountryOptions() {
  return (
    <>
      <optgroup label="Frequent lanes">
        {FREQUENT_OPTIONS.map(([code, name]) => (
          <option key={code} value={code}>
            {name} ({code})
          </option>
        ))}
      </optgroup>
      <optgroup label="All countries">
        {OTHER_COUNTRY_OPTIONS.map(([code, name]) => (
          <option key={code} value={code}>
            {name} ({code})
          </option>
        ))}
      </optgroup>
    </>
  );
}

const STEP_COUNT = 5;

const PRODUCT_FLAGS = [
  "is_textile",
  "is_electronics",
  "contains_battery",
  "is_food",
  "is_cosmetic",
  "is_medical_or_health_related",
  "is_chemical",
  "is_dual_use_or_restricted",
] as const;

const DEMO_TSHIRT: Partial<ProductInputSchema> = {
  product_name: "Men's short-sleeve knitted t-shirt",
  product_description: "100% cotton knitted short-sleeve t-shirt for men",
  material_composition: "100% cotton",
  intended_use: "apparel",
  category: "apparel",
  is_textile: true,
  origin_country: "TR",
  destination_country: "DE",
  declared_value: 1200,
  currency: "EUR",
  quantity: 500,
  import_or_export: "import",
};

const DEMO_BATTERY: Partial<ProductInputSchema> = {
  product_name: "Rechargeable lithium-ion battery pack for e-bike",
  product_description:
    "Rechargeable lithium-ion battery pack designed for electric bicycles",
  material_composition: "lithium-ion cells, plastic housing",
  intended_use: "e-bike power supply",
  category: "batteries",
  is_electronics: true,
  contains_battery: true,
  origin_country: "CN",
  destination_country: "GB",
  declared_value: 8000,
  currency: "GBP",
  quantity: 100,
  import_or_export: "import",
};

type QuickFindStatus = "idle" | "loading" | "found" | "not_found" | "error";

export function ClassificationWizard({
  t,
  mode = "authed",
  initialValues,
  onGuestResult,
}: {
  t: WizardMessages;
  /** "guest" renders the no-signup flow: one free classification, result inline. */
  mode?: "guest" | "authed";
  /** Prefill (reclassify from the SKU library). */
  initialValues?: Partial<ProductInputSchema>;
  /** Guest flow: called with the in-memory result instead of navigating. */
  onGuestResult?: (data: GuestClassification) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<{ name: string; type: string }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmNudge, setConfirmNudge] = useState(false);

  // Quick Find: type a brand/model, we fill the rest from a lookup. Only for
  // signed-in users (the lookup needs a session).
  const [quickFindOn, setQuickFindOn] = useState(false);
  const [quickFindQuery, setQuickFindQuery] = useState("");
  const [quickFindStatus, setQuickFindStatus] = useState<QuickFindStatus>("idle");
  const [quickFindMessage, setQuickFindMessage] = useState<string | null>(null);
  const [quickFindConfirmed, setQuickFindConfirmed] = useState(false);
  const [showConfirmNudge, setShowConfirmNudge] = useState(false);

  const form = useForm<ProductInputSchema>({
    resolver: zodResolver(productInputSchema),
    defaultValues: {
      import_or_export: "import",
      origin_country: "TR",
      destination_country: "DE",
      currency: "EUR",
      ...initialValues,
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, trigger, formState, setValue, watch } = form;

  const originCountry = watch("origin_country");
  const destinationCountry = watch("destination_country");
  const shippingMethod = watch("shipping_method");
  const roadOk = roadFeasible(originCountry, destinationCountry);

  useEffect(() => {
    if (!roadOk && shippingMethod === "road") {
      setValue("shipping_method", "", { shouldValidate: true });
    }
  }, [roadOk, shippingMethod, setValue]);

  const quickFindToken = useRef(0);
  useEffect(() => {
    if (!quickFindOn) return;
    const query = quickFindQuery.trim();
    if (query.length < 2) {
      setQuickFindStatus("idle");
      setQuickFindMessage(null);
      setQuickFindConfirmed(false);
      setShowConfirmNudge(false);
      return;
    }

    setQuickFindStatus("loading");
    setQuickFindConfirmed(false);
    setShowConfirmNudge(false);
    const token = ++quickFindToken.current;
    const handle = setTimeout(async () => {
      const result = await lookupProductAction(query);
      if (token !== quickFindToken.current) return; // stale response

      if (!result.ok) {
        setQuickFindStatus("error");
        setQuickFindMessage(result.error);
        return;
      }

      const data = result.data;
      if (!data.found) {
        setQuickFindStatus("not_found");
        setQuickFindMessage(
          data.degraded_reason
            ? `${data.degraded_reason} Try again in a minute, or turn off Quick Find to enter details manually.`
            : "No confident match. Try the full brand + model name, or turn off Quick Find to enter details manually.",
        );
        return;
      }

      setValue("product_name", data.product_name, { shouldValidate: true });
      setValue("product_description", data.product_description, { shouldValidate: true });
      if (data.material_composition) setValue("material_composition", data.material_composition);
      if (data.intended_use) setValue("intended_use", data.intended_use);
      if (data.category) setValue("category", data.category, { shouldValidate: true });
      if (data.brand) setValue("brand", data.brand);
      if (data.model) setValue("model", data.model);
      if (data.unit_weight_kg != null) setValue("unit_weight", data.unit_weight_kg);

      setQuickFindStatus("found");
      setQuickFindMessage(
        data.source === "ai"
          ? `Matched: ${data.product_name} — AI-identified, verify before relying on it.`
          : `Matched: ${data.product_name}`,
      );
    }, QUICK_FIND_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [quickFindQuery, quickFindOn, setValue]);

  function toggleQuickFind(on: boolean) {
    setQuickFindOn(on);
    setQuickFindStatus("idle");
    setQuickFindMessage(null);
    setQuickFindConfirmed(false);
    setShowConfirmNudge(false);
    if (!on) setQuickFindQuery("");
  }

  const fieldsLocked =
    quickFindOn && (quickFindStatus === "idle" || quickFindStatus === "loading");
  const lockedFieldProps = fieldsLocked
    ? {
        readOnly: true,
        tabIndex: -1,
        className: "pointer-events-none bg-muted/70 text-muted-foreground",
      }
    : {};

  function loadDemo(demo: Partial<ProductInputSchema>) {
    if (quickFindOn) toggleQuickFind(false);
    Object.entries(demo).forEach(([k, v]) =>
      setValue(k as keyof ProductInputSchema, v as never, { shouldValidate: true }),
    );
  }

  async function next() {
    if (step === 0 && quickFindOn && quickFindStatus === "found" && !quickFindConfirmed) {
      setShowConfirmNudge(true);
      return;
    }

    const fieldsByStep: (keyof ProductInputSchema)[][] = [
      ["product_name", "product_description", "sku", "brand", "model"],
      ["material_composition", "intended_use", "category"],
      ["origin_country", "destination_country", "shipping_method", "declared_value", "currency"],
      [],
      [],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).map((f) => ({
      name: f.name,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...selected]);
  }

  async function onSubmit(values: ProductInputSchema) {
    if (!confirmed) {
      setConfirmNudge(true);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    const result = await classifyAction(values);
    if (!result.ok) {
      setServerError(result.error);
      setSubmitting(false);
      return;
    }
    if (result.data.kind === "saved") {
      router.push(`/dashboard/classifications/${result.data.id}`);
      return;
    }
    onGuestResult?.(result.data.data);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {t.steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:block",
                i <= step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEP_COUNT - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5 pt-6">
          {/* Step 0 — Product identity */}
          {step === 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">{t.prefill}</span>
                  <button
                    type="button"
                    onClick={() => loadDemo(DEMO_TSHIRT)}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/80"
                  >
                    <Sparkles className="h-3 w-3" /> {t.demoTshirt}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemo(DEMO_BATTERY)}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/80"
                  >
                    <Sparkles className="h-3 w-3" /> {t.demoBattery}
                  </button>
                </div>

                {mode === "authed" && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium" id="quick-find-label">
                      {t.quickFind}
                    </span>
                    <Switch
                      aria-labelledby="quick-find-label"
                      checked={quickFindOn}
                      onChange={(e) => toggleQuickFind(e.target.checked)}
                    />
                  </div>
                )}
              </div>

              {quickFindOn ? (
                <div className="space-y-1.5 rounded-lg border border-primary/30 bg-accent/30 p-4">
                  <Label>
                    {t.quickFind} <span className="text-destructive"> *</span>
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={quickFindQuery}
                      onChange={(e) => setQuickFindQuery(e.target.value)}
                      placeholder={t.quickFindPlaceholder}
                      className="pl-9 pr-9"
                    />
                    {quickFindStatus === "loading" && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                    {quickFindStatus === "found" && (
                      <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
                    )}
                    {(quickFindStatus === "not_found" || quickFindStatus === "error") && (
                      <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warning" />
                    )}
                  </div>
                  {quickFindMessage && (
                    <p
                      className={cn(
                        "text-xs",
                        quickFindStatus === "found" && "text-success",
                        (quickFindStatus === "not_found" || quickFindStatus === "error") &&
                          "text-muted-foreground",
                      )}
                    >
                      {quickFindMessage}
                    </p>
                  )}

                  {quickFindStatus === "found" ? (
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={quickFindConfirmed}
                          onChange={(e) => {
                            setQuickFindConfirmed(e.target.checked);
                            if (e.target.checked) setShowConfirmNudge(false);
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-input"
                        />
                        <span>{t.quickFindConfirm}</span>
                      </label>
                      {showConfirmNudge && !quickFindConfirmed && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" /> {t.quickFindNudge}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t.quickFindHelp}</p>
                  )}
                </div>
              ) : null}

              <div className="space-y-5">
                <Field
                  label={t.fields.productName}
                  optionalLabel={t.optional}
                  error={formState.errors.product_name?.message}
                  required
                >
                  <Input
                    {...register("product_name")}
                    placeholder="Men's cotton t-shirt"
                    {...lockedFieldProps}
                  />
                </Field>
                <Field
                  label={t.fields.productDescription}
                  optionalLabel={t.optional}
                  error={formState.errors.product_description?.message}
                  required
                >
                  <Textarea
                    {...register("product_description")}
                    placeholder="100% cotton knitted short-sleeve t-shirt"
                    rows={3}
                    {...lockedFieldProps}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label={t.fields.sku} optionalLabel={t.optional}>
                    <Input {...register("sku")} placeholder="TS-001" {...lockedFieldProps} />
                  </Field>
                  <Field label={t.fields.brand} optionalLabel={t.optional}>
                    <Input {...register("brand")} placeholder="Acme" {...lockedFieldProps} />
                  </Field>
                  <Field label={t.fields.model} optionalLabel={t.optional}>
                    <Input {...register("model")} placeholder="V2" {...lockedFieldProps} />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* Step 1 — Product facts */}
          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fields.material} optionalLabel={t.optional}>
                  <Input {...register("material_composition")} placeholder="100% cotton" />
                </Field>
                <Field label={t.fields.intendedUse} optionalLabel={t.optional}>
                  <Input {...register("intended_use")} placeholder="apparel" />
                </Field>
              </div>
              <Field label={t.fields.category} optionalLabel={t.optional}>
                <Select {...register("category")}>
                  <option value="">{t.select}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium">{t.factsIntro}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PRODUCT_FLAGS.map((flag) => (
                    <label
                      key={flag}
                      className="flex items-start gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        {...register(flag)}
                        className="mt-0.5 h-4 w-4 rounded border-input"
                      />
                      <span>{t.flags[flag]}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t.factsHint}</p>
              </div>
            </>
          )}

          {/* Step 2 — Trade lane */}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t.fields.originCountry}
                  optionalLabel={t.optional}
                  error={formState.errors.origin_country?.message}
                  required
                >
                  <Select {...register("origin_country")}>
                    <CountryOptions />
                  </Select>
                </Field>
                <Field
                  label={t.fields.destinationCountry}
                  optionalLabel={t.optional}
                  error={formState.errors.destination_country?.message}
                  required
                >
                  <Select {...register("destination_country")}>
                    <CountryOptions />
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t.fields.supplierCountry}
                  optionalLabel={t.optional}
                  hint={t.supplierHint}
                >
                  <Select {...register("supplier_country")}>
                    <option value="">{t.select}</option>
                    <CountryOptions />
                  </Select>
                </Field>
                <Field
                  label={t.fields.shippingMethod}
                  optionalLabel={t.optional}
                  error={formState.errors.shipping_method?.message}
                  hint={!roadOk ? t.roadUnavailable : undefined}
                >
                  <Select {...register("shipping_method")}>
                    <option value="">{t.select}</option>
                    <option value="sea">{t.methods.sea}</option>
                    <option value="air">{t.methods.air}</option>
                    <option value="road" disabled={!roadOk}>
                      {!roadOk ? t.methods.roadNoRoute : t.methods.road}
                    </option>
                    <option value="courier">{t.methods.courier}</option>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label={t.fields.declaredValue} optionalLabel={t.optional}>
                  <Input type="number" step="0.01" {...register("declared_value")} placeholder="1200" />
                </Field>
                <Field label={t.fields.currency} optionalLabel={t.optional}>
                  <Select {...register("currency")}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label={t.fields.quantity} optionalLabel={t.optional}>
                  <Input type="number" step="1" {...register("quantity")} placeholder="500" />
                </Field>
                <Field label={t.fields.unitWeight} optionalLabel={t.optional}>
                  <Input type="number" step="0.01" {...register("unit_weight")} placeholder="0.2" />
                </Field>
              </div>
            </>
          )}

          {/* Step 3 — Documents (optional) */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t.documentsIntro}</p>
              <Field label={t.fields.invoiceText} optionalLabel={t.optional}>
                <Textarea
                  {...register("invoice_text")}
                  rows={3}
                  placeholder={t.invoicePlaceholder}
                />
              </Field>
              <Field label={t.fields.specText} optionalLabel={t.optional}>
                <Textarea
                  {...register("product_spec_text")}
                  rows={3}
                  placeholder={t.specPlaceholder}
                />
              </Field>
              <label className="flex items-start gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted/40">
                <input
                  type="checkbox"
                  {...register("certificate_of_origin_available")}
                  className="mt-0.5 h-4 w-4 rounded border-input"
                />
                <span>{t.fields.certificate}</span>
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 p-6 text-center hover:bg-muted/50">
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">{t.clickToSelect}</span>
                <span className="text-xs text-muted-foreground">{t.fileTypes}</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.csv,image/*"
                  className="hidden"
                  onChange={handleFiles}
                />
              </label>
              {files.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                    >
                      <span>{f.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {f.type || "unknown"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 4 — Generate (review + confirmation) */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">{t.reviewTitle}</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Review label={t.reviewProduct} value={watch("product_name")} />
                <Review label={t.fields.category} value={watch("category")} />
                <Review label={t.fields.material} value={watch("material_composition")} />
                <Review label={t.fields.intendedUse} value={watch("intended_use")} />
                <Review
                  label={t.reviewTradeLane}
                  value={`${watch("origin_country")} → ${watch("destination_country")}`}
                />
                <Review
                  label={t.fields.shippingMethod}
                  value={watch("shipping_method") || "—"}
                />
                <Review
                  label={t.fields.declaredValue}
                  value={
                    watch("declared_value")
                      ? `${watch("declared_value")} ${watch("currency")}`
                      : "—"
                  }
                />
                <Review
                  label={t.reviewFlags}
                  value={
                    PRODUCT_FLAGS.filter((f) => watch(f))
                      .map((f) => t.flags[f])
                      .join(", ") || "—"
                  }
                />
              </dl>
              <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {t.reviewNote}
              </p>
              <label className="flex items-start gap-2 rounded-md border border-primary/30 bg-accent/30 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    if (e.target.checked) setConfirmNudge(false);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-input"
                />
                <span>{t.confirmRecommendation}</span>
              </label>
              {confirmNudge && !confirmed && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {t.confirmNudge}
                </p>
              )}
              {serverError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
        >
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Button>

        {step < STEP_COUNT - 1 ? (
          <Button type="button" onClick={next}>
            {t.continue} <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.classify}
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  hint,
  optionalLabel = "(optional)",
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline gap-1.5">
        {label}
        {required ? (
          <span className="text-destructive" title="Required">*</span>
        ) : (
          <span className="text-[11px] font-normal text-muted-foreground">
            {optionalLabel}
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Review({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
