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
import {
  createClassificationAction,
  lookupProductAction,
} from "@/app/dashboard/classifications/actions";
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

const QUICK_FIND_DEBOUNCE_MS = 700;

const COUNTRY_OPTIONS = Object.entries(COUNTRIES);
const CURRENCIES = ["EUR", "GBP", "USD", "TRY"];
const CATEGORIES = PRODUCT_CATEGORIES;

const STEPS = ["Product", "Trade lane", "Documents", "Review"] as const;

const DEMO_TSHIRT: Partial<ProductInputSchema> = {
  product_name: "Men's short-sleeve knitted t-shirt",
  product_description: "100% cotton knitted short-sleeve t-shirt for men",
  material_composition: "100% cotton",
  intended_use: "apparel",
  category: "apparel",
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
  origin_country: "CN",
  destination_country: "GB",
  declared_value: 8000,
  currency: "GBP",
  quantity: 100,
  import_or_export: "import",
};

type QuickFindStatus = "idle" | "loading" | "found" | "not_found" | "error";

export function ClassificationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<{ name: string; type: string }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Find: when on, the user types a brand/model into one field and we
  // auto-fill the rest from a lookup instead of manual entry. Fields stay
  // locked only until a lookup resolves; once matched, they unlock so the
  // user can edit, and an explicit confirmation is required before Continue.
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
    },
    mode: "onTouched",
  });

  const { register, handleSubmit, trigger, formState, setValue, watch } = form;

  // Debounced Quick Find lookup — fires QUICK_FIND_DEBOUNCE_MS after typing
  // stops, fills the form fields on a confident match, and is honest (not a
  // fabricated guess) when nothing is recognized.
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
          "No confident match. Try the full brand + model name, or turn off Quick Find to enter details manually.",
        );
        return;
      }

      setValue("product_name", data.product_name, { shouldValidate: true });
      setValue("product_description", data.product_description, { shouldValidate: true });
      if (data.material_composition) setValue("material_composition", data.material_composition);
      if (data.intended_use) setValue("intended_use", data.intended_use);
      if (data.category) setValue("category", data.category, { shouldValidate: true });
      if (data.brand) setValue("brand", data.brand);
      if (data.model) setValue("sku", data.model);

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

  // Fields lock only while we don't yet have a resolved lookup — once a
  // search finishes (found, not found, or errored) they unlock so the user
  // can freely edit or type manually. NOT the native `disabled` attribute —
  // React Hook Form excludes disabled fields from validation entirely.
  const fieldsLocked = quickFindOn && (quickFindStatus === "idle" || quickFindStatus === "loading");
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
      ["product_name", "product_description", "material_composition", "intended_use", "category"],
      ["origin_country", "destination_country", "import_or_export", "declared_value", "currency"],
      [],
      [],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).map((f) => ({
      name: f.name,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...selected]);
  }

  async function onSubmit(values: ProductInputSchema) {
    setSubmitting(true);
    setServerError(null);
    const result = await createClassificationAction(values);
    if (result.ok) {
      router.push(`/dashboard/classifications/${result.data.id}`);
    } else {
      setServerError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
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
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-border" />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5 pt-6">
          {/* Step 0 — Product basics */}
          {step === 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Prefill a demo:</span>
                  <button
                    type="button"
                    onClick={() => loadDemo(DEMO_TSHIRT)}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/80"
                  >
                    <Sparkles className="h-3 w-3" /> Cotton t-shirt
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemo(DEMO_BATTERY)}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/80"
                  >
                    <Sparkles className="h-3 w-3" /> E-bike battery
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium" id="quick-find-label">
                    Quick Find
                  </span>
                  <Switch
                    aria-labelledby="quick-find-label"
                    checked={quickFindOn}
                    onChange={(e) => toggleQuickFind(e.target.checked)}
                  />
                </div>
              </div>

              {quickFindOn ? (
                <div className="space-y-1.5 rounded-lg border border-primary/30 bg-accent/30 p-4">
                  <Label>
                    Quick find <span className="text-destructive"> *</span>
                  </Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={quickFindQuery}
                      onChange={(e) => setQuickFindQuery(e.target.value)}
                      placeholder="e.g. S-Works Tarmac SL9"
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
                        <span>
                          The fields below are now editable — review them, fix
                          anything wrong, then confirm before continuing.
                        </span>
                      </label>
                      {showConfirmNudge && !quickFindConfirmed && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" /> Please confirm the
                          details are correct before continuing.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Type a brand + model and we'll fill in the description, material,
                      use, category, brand and model below.
                    </p>
                  )}
                </div>
              ) : null}

              {/*
                Locked fields use readOnly + pointer-events-none + tabIndex=-1
                instead of the native `disabled` attribute. React Hook Form
                excludes disabled fields from validation/values entirely, which
                would silently block submission even after Quick Find fills
                them in — readOnly keeps the values valid while still blocking
                user edits.
              */}
              <div className="space-y-5">
                <Field label="Product name" error={formState.errors.product_name?.message} required>
                  <Input
                    {...register("product_name")}
                    placeholder="Men's cotton t-shirt"
                    {...lockedFieldProps}
                  />
                </Field>
                <Field
                  label="Product description"
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Material / composition">
                    <Input
                      {...register("material_composition")}
                      placeholder="100% cotton"
                      {...lockedFieldProps}
                    />
                  </Field>
                  <Field label="Intended use">
                    <Input
                      {...register("intended_use")}
                      placeholder="apparel"
                      {...lockedFieldProps}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Category">
                    <Select {...register("category")} {...lockedFieldProps}>
                      <option value="">Select…</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Brand">
                    <Input
                      {...register("brand")}
                      placeholder="Acme"
                      {...lockedFieldProps}
                    />
                  </Field>
                  <Field label="Model / SKU">
                    <Input
                      {...register("sku")}
                      placeholder="TS-001"
                      {...lockedFieldProps}
                    />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* Step 1 — Trade lane */}
          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Origin country" error={formState.errors.origin_country?.message} required>
                  <Select {...register("origin_country")}>
                    {COUNTRY_OPTIONS.map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Destination country" error={formState.errors.destination_country?.message} required>
                  <Select {...register("destination_country")}>
                    {COUNTRY_OPTIONS.map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Direction">
                  <Select {...register("import_or_export")}>
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                  </Select>
                </Field>
                <Field label="Supplier country">
                  <Select {...register("supplier_country")}>
                    <option value="">Select…</option>
                    {COUNTRY_OPTIONS.map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Shipping method">
                  <Select {...register("shipping_method")}>
                    <option value="">Select…</option>
                    <option value="sea">Sea freight</option>
                    <option value="air">Air freight</option>
                    <option value="road">Road</option>
                    <option value="courier">Courier / parcel</option>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Declared value">
                  <Input type="number" step="0.01" {...register("declared_value")} placeholder="1200" />
                </Field>
                <Field label="Currency">
                  <Select {...register("currency")}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Quantity">
                  <Input type="number" step="1" {...register("quantity")} placeholder="500" />
                </Field>
                <Field label="Unit weight (kg)">
                  <Input type="number" step="0.01" {...register("unit_weight")} placeholder="0.2" />
                </Field>
              </div>
            </>
          )}

          {/* Step 2 — Documents (optional, placeholder) */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Optionally attach supporting documents (commercial invoice, packing
                list, supplier spec sheet, product catalog). For now we capture file
                metadata — full extraction is a placeholder and won't change the
                classification yet.
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 p-8 text-center hover:bg-muted/50">
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Click to select files</span>
                <span className="text-xs text-muted-foreground">PDF, text, images</span>
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

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Review & classify</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Review label="Product" value={watch("product_name")} />
                <Review label="Category" value={watch("category")} />
                <Review label="Material" value={watch("material_composition")} />
                <Review label="Intended use" value={watch("intended_use")} />
                <Review
                  label="Trade lane"
                  value={`${watch("origin_country")} → ${watch("destination_country")} (${watch("import_or_export")})`}
                />
                <Review
                  label="Declared value"
                  value={
                    watch("declared_value")
                      ? `${watch("declared_value")} ${watch("currency")}`
                      : "—"
                  }
                />
                <Review label="Documents attached" value={String(files.length)} />
              </dl>
              <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                We'll normalize the description, retrieve candidate codes, reason
                over them, and produce a broker-ready report with a confidence
                score. High-risk or low-confidence items are flagged for review.
              </p>
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
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Classify product
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
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
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
