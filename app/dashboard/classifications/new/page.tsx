import { ClassificationWizard } from "@/components/classification/wizard";
import { DisclaimerBanner } from "@/components/disclaimer";

export const metadata = { title: "New classification — TariffOS" };

export default function NewClassificationPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New classification</h1>
        <p className="text-sm text-muted-foreground">
          Enter product details to get a recommended tariff code with evidence,
          confidence, and a broker-ready report.
        </p>
      </div>
      <ClassificationWizard />
      <DisclaimerBanner />
    </div>
  );
}
